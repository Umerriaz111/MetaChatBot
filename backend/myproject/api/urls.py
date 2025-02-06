from django.urls import path
from . import views

urlpatterns = [
    path('search/', views.search, name='search'),
    path('search2/', views.search2, name='search2'),

    # User URLs
    path('users/', views.UserList.as_view(), name='user-list'),
    path('users/<int:pk>/', views.UserDetail.as_view(), name='user-detail'),

    # ChatSession URLs
    path('sessions/', views.ChatSessionList.as_view(), name='chat-session-list'),
    path('sessions/<int:pk>/', views.ChatSessionDetail.as_view(), name='chat-session-detail'),

    # Message URLs
    path('sessions/<int:session_id>/messages/', views.MessageList.as_view(), name='message-list'),
    path('messages/<int:pk>/', views.MessageDetail.as_view(), name='message-detail'),
]
