from rest_framework import serializers
from django.utils import timezone
from .models import Task
from projects.serializers import ProjectSerializer
from projects.models import Project, ProjectMember

class TaskSerializer(serializers.ModelSerializer):
    project_data = ProjectSerializer(source='project', read_only=True)
    current_user_role = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ('id', 'title', 'description', 'deadline', 'priority', 'status', 'project', 'project_data', 'parent_task', 'created_at', 'current_user_role')
        read_only_fields = ('id', 'created_at', 'current_user_role')

    def get_current_user_role(self, obj):
        """
        Возвращает роль текущего пользователя в проекте, к которому относится задача
        """
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
            
        user = request.user
        project = obj.project
        
        # Если пользователь - создатель проекта
        if project.creator == user:
            return 'creator'
            
        # Пытаемся найти запись ProjectMember для пользователя
        try:
            member = project.projectmember_set.get(user=user)
            return member.role
        except ProjectMember.DoesNotExist:
            return None

    def validate_deadline(self, value):
        if value and timezone.is_naive(value):
            return timezone.make_aware(value)
        return value