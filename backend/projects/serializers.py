from rest_framework import serializers
from .models import Project, ProjectMember
from users.serializers import UserSerializer

class ProjectMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ProjectMember
        fields = ('id', 'user', 'role')
        read_only_fields = ('id',)

class ProjectSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    members = ProjectMemberSerializer(source='projectmember_set', many=True, read_only=True)

    class Meta:
        model = Project
        fields = ('id', 'name', 'description', 'is_public', 'creator', 'members', 'created_at')
        read_only_fields = ('id', 'creator', 'created_at')

    def create(self, validated_data):
        validated_data['creator'] = self.context['request'].user
        project = super().create(validated_data)
        # Автоматически добавляем создателя как админа
        ProjectMember.objects.create(
            user=self.context['request'].user,
            project=project,
            role='admin'
        )
        return project
