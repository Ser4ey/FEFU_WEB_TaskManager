# tasks/notifications.py
import time
from datetime import datetime, timedelta
from .models import Task
from .email_service import EmailService
import os
from dotenv import load_dotenv
from django.utils import timezone




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
    use_tls = True

    # Create an instance of the EmailService
    email_service = EmailService(smtp_host, smtp_port, smtp_user, smtp_password, use_tls)

    #email_service.send_email("test@domain.com", "Тест", "Проверка SMTP", "25 мая 2025")

    while True:
        #print("iteration")
        now = timezone.now()
        upcoming_tasks = Task.objects.filter(deadline__gte=now, status='in_progress')
        print(upcoming_tasks)

        print("Время сейчас UTC:", now)

        for task in upcoming_tasks:
            task_status = task.status
            user_email = task.project.creator.email
            username = task.project.creator.username
            task_title = task.title
            task_time = task.deadline

            delta = task_time - now

            print(f"Deadline (UTC): {task_time}")

            #За неделю
            if timedelta(days=6, hours=23, minutes=59) <= delta <= timedelta(days=7, minutes=1):
                key = (task.id, '7d')
                if key not in notified_tasks:
                    notified_tasks.add(key)
                    print(f"напоминание за 7 дней: {task_title}")
                    email_service.send_email(user_email, username, task_title, task_time)

            #за 1 день
            elif timedelta(hours=23, minutes=59) <= delta <= timedelta(days=1, minutes=1):
                key = (task.id, '1d')
                if key not in notified_tasks:
                    notified_tasks.add(key)
                    print(f"напоминание за 1 день: {task_title}")
                    email_service.send_email(user_email, username, task_title, task_time)

            #за 6 часов
            elif timedelta(hours=5, minutes=59) <= delta <= timedelta(hours=6, minutes=1):
                key = (task.id, '6h')
                if key not in notified_tasks:
                    notified_tasks.add(key)
                    print(f"напоминание за 6 часов: {task_title}")
                    email_service.send_email(user_email, username, task_title, task_time)



        time.sleep(60)
