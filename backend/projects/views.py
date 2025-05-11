from django.shortcuts import render
from django.db import models
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Project, ProjectMember
from .serializers import ProjectSerializer, ProjectMemberSerializer
from .permissions import IsProjectCreator, IsProjectPublicOrMember, IsProjectAdmin

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, IsProjectPublicOrMember]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Project.objects.none()
            
        user = self.request.user
        if user.is_anonymous:
            return Project.objects.filter(is_public=True)
            
        return Project.objects.filter(
            models.Q(creator=user) |
            models.Q(members=user) |
            models.Q(is_public=True)
        ).distinct()

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsProjectCreator()]
        return super().get_permissions()

    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        project = self.get_object()
        if not IsProjectAdmin().has_object_permission(request, self, project):
            return Response(
                {"detail": "У вас нет прав для добавления участников"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ProjectMemberSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(project=project)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        project = self.get_object()
        if not IsProjectAdmin().has_object_permission(request, self, project):
            return Response(
                {"detail": "У вас нет прав для удаления участников"},
                status=status.HTTP_403_FORBIDDEN
            )

        member_id = request.data.get('member_id')
        try:
            member = ProjectMember.objects.get(project=project, id=member_id)
            member.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProjectMember.DoesNotExist:
            return Response(
                {"detail": "Участник не найден"},
                status=status.HTTP_404_NOT_FOUND
            )