# tasks/notifications.py
import time
from datetime import datetime, timedelta
from .models import Task
from .email_service import EmailService
import os
from dotenv import load_dotenv

def load_data_from_env():
    load_dotenv()

    smtp_host = str(os.getenv("smtp_host"))
    smtp_port = str(os.getenv("smtp_port"))
    smtp_user = str(os.getenv("smtp_user"))
    smtp_password = str(os.getenv("smtp_password"))

    return smtp_host, smtp_port, smtp_user, smtp_password


def check_deadlines():
    smtp_host, smtp_port, smtp_user, smtp_password = load_data_from_env()
    use_tls = True # Set to False if your server does not use TLS

    # Create an instance of the EmailService
    email_service = EmailService(smtp_host, smtp_port, smtp_user, smtp_password, use_tls)

    email_service.send_email("your_test_email@domain.com", "Тест", "Проверка SMTP", "31 мая 2025")

    while True:
        now = datetime.now()
        upcoming_tasks = Task.objects.filter(
            deadline__gte=now,
            deadline__lte=now + timedelta(days=1)
        )
        for task in upcoming_tasks:
            # ... existing code ...
            print(f"⚠️ Задача '{task.title}' истекает {task.deadline} (Пользователь: {task.project.creator.username}, Email: {task.project.creator.email}), дедлайн:{task.deadline}")

            # Send email notification
            user_email = task.project.creator.email
            username = task.project.creator.username
            task_title = task.title
            task_time = task.deadline
            email_service.send_email(user_email, username, task_title, task_time)

        time.sleep(3600)  # Проверять каждые 60 минут
