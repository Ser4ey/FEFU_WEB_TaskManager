from rest_framework import generics, permissions, filters
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .serializers import UserRegistrationSerializer, UserSerializer

User = get_user_model()

# Create your views here.

class RegisterView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserRegistrationSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "user": UserSerializer(user, context=self.get_serializer_context()).data,
                "message": "Пользователь успешно создан",
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class UserSearchView(generics.ListAPIView):
    """
    Поиск пользователей по имени пользователя для добавления в проект
    """
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer
    
    def get_queryset(self):
        query = self.request.query_params.get('search', '')
        if not query:
            return User.objects.none()
            
        # Фильтруем по запросу и исключаем текущего пользователя
        queryset = User.objects.filter(username__icontains=query).exclude(id=self.request.user.id)
        
        # Применяем срез после всех фильтров
        return queryset[:10]