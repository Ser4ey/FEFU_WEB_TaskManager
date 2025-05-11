from rest_framework import permissions

class IsProjectCreator(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.creator == request.user

class IsProjectMember(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if obj.is_public:
            return True
        return obj.members.filter(id=request.user.id).exists()

class IsProjectAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if obj.creator == request.user:
            return True
        return obj.projectmember_set.filter(user=request.user, role='admin').exists()

class IsProjectPublicOrMember(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if obj.is_public:
            return request.method in permissions.SAFE_METHODS
        return obj.members.filter(id=request.user.id).exists() 