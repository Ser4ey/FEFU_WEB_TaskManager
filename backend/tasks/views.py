from django.shortcuts import render
from django.db import models
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Task
from .serializers import TaskSerializer
from .permissions import IsTaskProjectPublicOrMember, IsTaskProjectMember

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsTaskProjectPublicOrMember]

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsTaskProjectMember()]
        return super().get_permissions()

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Task.objects.none()
            
        user = self.request.user
        if user.is_anonymous:
            return Task.objects.filter(project__is_public=True)
            
        return Task.objects.filter(
            models.Q(project__creator=user) |
            models.Q(project__members=user) |
            models.Q(project__is_public=True)
        ).distinct()