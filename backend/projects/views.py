from django.db import models
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .models import Project, ProjectMember
from .serializers import ProjectSerializer, ProjectMemberSerializer
from .permissions import IsProjectCreator, IsProjectPublicOrMember, IsProjectAdmin
from backend.views import BaseModelViewSet

User = get_user_model()

class ProjectViewSet(BaseModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, IsProjectPublicOrMember]
    model = Project

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsProjectCreator()]
        return super().get_permissions()
        
    def get_public_queryset(self):
        #только участники могут видеть публичные проекты
        user = self.request.user
        return Project.objects.filter(
            is_public=True,
            members=user
        )
        
    def get_authenticated_queryset(self, user):
        #пользователь может видеть только свои проекты или проекты, в которых он участник
        return Project.objects.filter(
            models.Q(creator=user) |
            models.Q(members=user)
        ).distinct()

    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        project = self.get_object()
        if not IsProjectAdmin().has_object_permission(request, self, project):
            return Response(
                {"detail": "У вас нет прав для управления участниками проекта"},
                status=status.HTTP_403_FORBIDDEN
            )

        #проверяем передан ли user_id и role
        user_id = request.data.get('user_id')
        role = request.data.get('role')
        
        if not user_id or not role:
            return Response(
                {"detail": "Необходимо выбрать пользователя и указать роль"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        #проверяем, существует ли пользователь
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"detail": "Пользователь не найден"},
                status=status.HTTP_404_NOT_FOUND
            )
            
        #проверяем, не пытается ли пользователь изменить роль создателя
        if user == project.creator and role != 'admin':
            return Response(
                {"detail": "Нельзя изменить роль создателя проекта"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        #создаем или обновляем участника
        project_member, created = ProjectMember.objects.update_or_create(
            project=project,
            user=user,
            defaults={'role': role}
        )
        
        serializer = ProjectMemberSerializer(project_member)
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(serializer.data, status=status_code)

    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        project = self.get_object()
        if not IsProjectAdmin().has_object_permission(request, self, project):
            return Response(
                {"detail": "У вас нет прав для удаления участников"},
                status=status.HTTP_403_FORBIDDEN
            )

        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {"detail": "Необходимо указать ID пользователя"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        #проверяем, не пытается ли пользователь удалить создателя
        try:
            user = User.objects.get(id=user_id)
            if user == project.creator:
                return Response(
                    {"detail": "Нельзя удалить создателя проекта"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except User.DoesNotExist:
            return Response(
                {"detail": "Пользователь не найден"},
                status=status.HTTP_404_NOT_FOUND
            )
            
        try:
            member = ProjectMember.objects.get(project=project, user_id=user_id)
            member.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProjectMember.DoesNotExist:
            return Response(
                {"detail": "Пользователь не является участником проекта"},
                status=status.HTTP_404_NOT_FOUND
            )