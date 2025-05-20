from django.db import migrations

def update_roles(apps, schema_editor):
    ProjectMember = apps.get_model('projects', 'ProjectMember')
    
    # Обновляем существующие записи: 'member' -> 'editor', 'guest' -> 'viewer'
    ProjectMember.objects.filter(role='member').update(role='editor')
    ProjectMember.objects.filter(role='guest').update(role='viewer')

class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0002_alter_projectmember_role'),
    ]

    operations = [
        migrations.RunPython(update_roles),
    ] 