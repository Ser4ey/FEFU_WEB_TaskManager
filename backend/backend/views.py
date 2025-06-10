from django.db import models
from rest_framework import viewsets

class BaseModelViewSet(viewsets.ModelViewSet):
    #базовый ViewSet с общей логикой фильтрации объектов:
    #если пользователь анонимный — отдаем только публичные объекты,
    #иначе — вызываем метод для авторизованных пользователей.
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return self.model.objects.none()
            
        user = self.request.user
        if user.is_anonymous:
            return self.get_public_queryset()
            
        return self.get_authenticated_queryset(user)
    
    def get_public_queryset(self):
        #получает queryset для публичных объектов (переопределяется в наследниках)
        raise NotImplementedError('Subclasses must implement get_public_queryset()')
        
    def get_authenticated_queryset(self, user):
        #получает queryset для аутентифицированного пользователя (переопределяется в наследниках)
        raise NotImplementedError('Subclasses must implement get_authenticated_queryset()') 