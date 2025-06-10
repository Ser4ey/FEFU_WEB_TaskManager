from django.db import models
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Task
from .serializers import TaskSerializer
from .permissions import IsTaskProjectPublicOrMember, IsTaskProjectEditor, IsTaskProjectViewer
from backend.views import BaseModelViewSet

class TaskViewSet(BaseModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsTaskProjectViewer]
    model = Task

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy', 'create']:
            return [IsAuthenticated(), IsTaskProjectEditor()]
        return super().get_permissions()

    def get_public_queryset(self):
        #только участники проекта могут видеть задачи публичных проектов
        user = self.request.user
        return Task.objects.filter(
            project__is_public=True,
            project__members=user
        )
        
    def get_authenticated_queryset(self, user):
        #пользователь может видеть задачи только в своих проектах или проектах, где он участник
        return Task.objects.filter(
            models.Q(project__creator=user) |
            models.Q(project__members=user)
        ).distinct()
        
    def perform_create(self, serializer):
        #при создании задачи устанавливаем проект, к которому пользователь имеет доступ
        serializer.save()