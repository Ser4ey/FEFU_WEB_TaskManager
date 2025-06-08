from django.apps import AppConfig
import threading
import sys
import os

class TasksConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'tasks'

    def ready(self):
        if 'runserver' not in sys.argv:
            return  # чтобы чек дедлайнс не работал при создании миграций (т.к. он пытается ссылаться на бд, которой может еще не быть)

        # чтобы письмо не отправлялось дважды
        if os.environ.get('RUN_MAIN') != 'true':
            return

        print("ready (starting deadline checker)")
        from .notifications import check_deadlines
        thread = threading.Thread(target=check_deadlines, daemon=True)
        thread.start()


default_app_config = 'tasks.apps.TasksConfig'