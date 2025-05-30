from django.apps import AppConfig
import threading

class TasksConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'tasks'

    def ready(self):
        print("ready")
        from .notifications import check_deadlines
        thread = threading.Thread(target=check_deadlines)
        thread.daemon = True
        thread.start()


default_app_config = 'tasks.apps.TasksConfig'