from django.urls import path
from .views import RegisterView, UserView, UserSearchView

urlpatterns = [
    # path('register/', RegisterView.as_view(), name='register'),
    path('user/', UserView.as_view(), name='user'),
    path('search/', UserSearchView.as_view(), name='user-search'),
] 