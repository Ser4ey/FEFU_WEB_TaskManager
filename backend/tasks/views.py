from django.db import models
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Task
from .serializers import TaskSerializer
from .permissions import IsTaskProjectPublicOrMember, IsTaskProjectMember
from backend.views import BaseModelViewSet

class TaskViewSet(BaseModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsTaskProjectPublicOrMember]
    model = Task

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsTaskProjectMember()]
        return super().get_permissions()

    def get_public_queryset(self):
        return Task.objects.filter(project__is_public=True)
        
    def get_authenticated_queryset(self, user):
        return Task.objects.filter(
            models.Q(project__creator=user) |
            models.Q(project__members=user) |
            models.Q(project__is_public=True)
        ).distinct()