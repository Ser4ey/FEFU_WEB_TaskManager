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
    notified_tasks = set()
    smtp_host, smtp_port, smtp_user, smtp_password = load_data_from_env()
    use_tls = True # Set to False if your server does not use TLS

    # Create an instance of the EmailService
    email_service = EmailService(smtp_host, smtp_port, smtp_user, smtp_password, use_tls)

    #email_service.send_email("test@domain.com", "Тест", "Проверка SMTP", "25 мая 2025")

    while True:
        print("iteration")
        now = datetime.now()
        upcoming_tasks = Task.objects.filter(
            deadline__gte=now,
            deadline__lte=now + timedelta(days=1)
        )
        print(upcoming_tasks)
        for task in upcoming_tasks:
            task_status = task.status
            user_email = task.project.creator.email
            username = task.project.creator.username
            task_title = task.title
            task_time = task.deadline




            if task_status != 'in_progress':
                continue
            email_fingerprint = (task_status, user_email, username, task_title, task_time)

            print(email_fingerprint)
            print(notified_tasks)
            print("принттт")

            if email_fingerprint in notified_tasks:
                continue
            else:
                notified_tasks.add(email_fingerprint)

            print(f"⚠️ Задача '{task.title}' истекает {task.deadline} (Пользователь: {task.project.creator.username}, Email: {task.project.creator.email}), дедлайн:{task.deadline}")

            # Send email notification



            email_service.send_email(user_email, username, task_title, task_time)



        time.sleep(20)  # Проверять каждые 60 минут
