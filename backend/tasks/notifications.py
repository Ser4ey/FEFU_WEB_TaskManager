# tasks/notifications.py
import time
from datetime import datetime, timedelta
from .models import Task
from .email_service import EmailService

def check_deadlines():
    # Configure your SMTP server details here
    smtp_host = "smtp.gmail.com"
    smtp_port = 587 # or your SMTP port
    smtp_user = "gusuevon43@gmail.com" # Optional: your email address
    smtp_password = "xozi gwlr dbwm uuqo" # Optional: your email password
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
            print(f"⚠️ Задача '{task.title}' истекает {task.deadline} (Пользователь: {task.project.creator.username}, Email: {task.project.creator.email})")

            # Send email notification
            user_email = task.project.creator.email
            username = task.project.creator.username
            task_title = task.title
            task_time = 12
            email_service.send_email(user_email, username, task_title, task_time)

        time.sleep(3600)  # Проверять каждые 60 минут
