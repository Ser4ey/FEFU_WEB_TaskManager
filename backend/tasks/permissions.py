from rest_framework import permissions
from projects.permissions import IsProjectPublicOrMember, IsProjectViewer, IsProjectEditor

class IsTaskProjectPublicOrMember(permissions.BasePermission):
    #проверяет, имеет ли пользователь доступ к задаче.
    def has_object_permission(self, request, view, obj):
        # Проверяем доступ к проекту задачи
        return IsProjectViewer().has_object_permission(request, view, obj.project)

class IsTaskProjectMember(permissions.BasePermission):
    #проверяет, имеет ли пользователь доступ на редактирование задачи.
    def has_object_permission(self, request, view, obj):
        # Проверяем, имеет ли пользователь право редактирования проекта
        return IsProjectEditor().has_object_permission(request, view, obj.project)

class IsTaskProjectViewer(permissions.BasePermission):
    #проверяет, имеет ли пользователь доступ на чтение задачи.
    #пользователь должен иметь роль viewer или выше в проекте задачи.
    def has_object_permission(self, request, view, obj):
        #проверяем, что пользователь имеет право просмотра проекта
        return IsProjectViewer().has_object_permission(request, view, obj.project)

class IsTaskProjectEditor(permissions.BasePermission):
    #проверяет, имеет ли пользователь доступ на редактирование задачи.
    #пользователь должен иметь роль editor или admin в проекте задачи.
    def has_object_permission(self, request, view, obj):
        #проверяем, что пользователь имеет право редактирования проекта
        return IsProjectEditor().has_object_permission(request, view, obj.project) 