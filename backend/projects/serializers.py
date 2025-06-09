from rest_framework import serializers
from .models import Project, ProjectMember
from users.serializers import UserSerializer

class ProjectMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True, required=True)

    class Meta:
        model = ProjectMember
        fields = ('id', 'user', 'user_id', 'role')
        read_only_fields = ('id',)

    def create(self, validated_data):
        #извлекаем user_id из validated_data и получаем объект User
        user_id = validated_data.pop('user_id')
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = User.objects.get(id=user_id)
        
        #создаем объект ProjectMember
        return ProjectMember.objects.create(
            user=user,
            **validated_data
        )

class ProjectSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    members = ProjectMemberSerializer(source='projectmember_set', many=True, read_only=True)
    current_user_role = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ('id', 'name', 'description', 'is_public', 'creator', 'members', 'created_at', 'current_user_role')
        read_only_fields = ('id', 'creator', 'created_at', 'current_user_role')

    def get_current_user_role(self, obj):
        #возвращает роль текущего пользователя в проекте
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
            
        user = request.user
        
        #если пользователь - создатель проекта
        if obj.creator == user:
            return 'creator'
            
        #находим запись ProjectMember пользователя
        try:
            member = obj.projectmember_set.get(user=user)
            return member.role
        except ProjectMember.DoesNotExist:
            return None

    def create(self, validated_data):
        validated_data['creator'] = self.context['request'].user
        project = super().create(validated_data)
        #автоматически добавляем создателя как админа
        ProjectMember.objects.create(
            user=self.context['request'].user,
            project=project,
            role='admin'
        )
        return project
