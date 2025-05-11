from rest_framework import serializers
from django.utils import timezone
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'deadline', 'priority', 'status', 'project', 'parent_task']

    def validate_deadline(self, value):
        if value and timezone.is_naive(value):
            return timezone.make_aware(value)
        return value