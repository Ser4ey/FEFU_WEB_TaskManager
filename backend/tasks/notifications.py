# tasks/notifications.py
import time
from datetime import datetime, timedelta
from .models import Task

def check_deadlines():
    while True:
        now = datetime.now()
        upcoming_tasks = Task.objects.filter(
            deadline__gte=now,
            deadline__lte=now + timedelta(days=1)
        )
        for task in upcoming_tasks:
            print(f"⚠️ Задача '{task.title}' истекает {task.deadline}")
        time.sleep(3600)  # Проверять каждые 60 минут