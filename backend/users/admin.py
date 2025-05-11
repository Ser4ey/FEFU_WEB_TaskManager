from django.contrib import admin

# Register your models here.
# projects/admin.py
from django.contrib import admin
from projects.models import Project, ProjectMember

admin.site.register(Project)
admin.site.register(ProjectMember)

# tasks/admin.py
from django.contrib import admin
from tasks.models import Task

admin.site.register(Task)