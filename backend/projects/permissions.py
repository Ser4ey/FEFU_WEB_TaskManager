from rest_framework import permissions

class IsProjectCreator(permissions.BasePermission):
    """
    Проверяет, является ли пользователь создателем проекта.
    Только создатель может удалять проект или управлять настройками проекта.
    """
    def has_object_permission(self, request, view, obj):
        return obj.creator == request.user

class IsProjectMember(permissions.BasePermission):
    """
    Проверяет, является ли пользователь участником проекта.
    """
    def has_object_permission(self, request, view, obj):
        # Проверяем, есть ли пользователь в списке участников
        return obj.members.filter(id=request.user.id).exists()

class IsProjectAdmin(permissions.BasePermission):
    """
    Проверяет, имеет ли пользователь роль admin в проекте.
    Администраторы (включая создателя) могут управлять правами доступа.
    """
    def has_object_permission(self, request, view, obj):
        if obj.creator == request.user:
            return True
        return obj.projectmember_set.filter(user=request.user, role='admin').exists()

class IsProjectEditor(permissions.BasePermission):
    """
    Проверяет, имеет ли пользователь роль editor или выше в проекте.
    Редакторы могут редактировать задачи, но не сам проект.
    """
    def has_object_permission(self, request, view, obj):
        if obj.creator == request.user:
            return True
        return obj.projectmember_set.filter(
            user=request.user, 
            role__in=['admin', 'editor']
        ).exists()

class IsProjectViewer(permissions.BasePermission):
    """
    Проверяет, имеет ли пользователь роль viewer или выше в проекте.
    Просмотрщики могут только просматривать проект и задачи.
    """
    def has_object_permission(self, request, view, obj):
        if obj.creator == request.user:
            return True
        return obj.projectmember_set.filter(
            user=request.user, 
            role__in=['admin', 'editor', 'viewer']
        ).exists()

class IsProjectPublicOrMember(permissions.BasePermission):
    """
    Проверяет, имеет ли пользователь доступ к проекту.
    Если проект публичный, пользователь должен быть явно добавлен с ролью
    для получения доступа. Создатель проекта всегда имеет полный доступ.
    """
    def has_object_permission(self, request, view, obj):
        # Создатель всегда имеет доступ
        if obj.creator == request.user:
            return True
        
        # Проверяем, есть ли пользователь в списке участников
        is_member = obj.projectmember_set.filter(user=request.user).exists()
        
        # Если проект публичный и это безопасный метод (GET, HEAD, OPTIONS),
        # и пользователь является участником, разрешаем доступ
        if obj.is_public and request.method in permissions.SAFE_METHODS and is_member:
            return True
            
        # Для небезопасных методов или если проект не публичный, 
        # нужно быть участником
        return is_member 