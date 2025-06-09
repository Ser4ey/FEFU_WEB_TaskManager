from rest_framework import permissions

class IsProjectCreator(permissions.BasePermission):
    #проверяет, что пользователь — создатель проекта.
    #только создатель может удалять проект или менять его настройки.
    def has_object_permission(self, request, view, obj):
        return obj.creator == request.user

class IsProjectMember(permissions.BasePermission):
    #проверяет, что пользователь — участник проекта.
    def has_object_permission(self, request, view, obj):
        #проверяем, есть ли пользователь в списке участников
        return obj.members.filter(id=request.user.id).exists()

class IsProjectAdmin(permissions.BasePermission):
    #проверяет, что пользователь — администратор проекта.
    #админы и создатель могут управлять правами доступа.
    def has_object_permission(self, request, view, obj):
        if obj.creator == request.user:
            return True
        return obj.projectmember_set.filter(user=request.user, role='admin').exists()

class IsProjectEditor(permissions.BasePermission):
    #проверяет, что у пользователя роль editor или admin.
    #редакторы могут менять задачи, но не сам проект.
    def has_object_permission(self, request, view, obj):
        if obj.creator == request.user:
            return True
        return obj.projectmember_set.filter(
            user=request.user, 
            role__in=['admin', 'editor']
        ).exists()

class IsProjectViewer(permissions.BasePermission):
    #проверяет, что у пользователя есть хотя бы роль viewer.
    #просмотрщики могут только просматривать проект и задачи.
    def has_object_permission(self, request, view, obj):
        if obj.creator == request.user:
            return True
        return obj.projectmember_set.filter(
            user=request.user, 
            role__in=['admin', 'editor', 'viewer']
        ).exists()

class IsProjectPublicOrMember(permissions.BasePermission):
    #доступ разрешён, если:
    # - пользователь — создатель проекта
    # - проект публичный и пользователь-участник и метод безопасный (get, head, options)
    # - проект не публичный, но пользователь-участник
    def has_object_permission(self, request, view, obj):
        if obj.creator == request.user:
            return True

        is_member = obj.projectmember_set.filter(user=request.user).exists()

        if obj.is_public and request.method in permissions.SAFE_METHODS and is_member:
            return True

        return is_member 