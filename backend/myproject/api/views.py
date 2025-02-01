from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from langchain_community.utilities import SearxSearchWrapper

from rest_framework import generics, permissions
from django.contrib.auth.models import User
from .models import ChatSession, Message
from .serializers import UserSerializer, ChatSessionSerializer, MessageSerializer

# User Views
class UserList(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class UserDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

# ChatSession Views
class ChatSessionList(generics.ListCreateAPIView):
    queryset = ChatSession.objects.all()
    serializer_class = ChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # The 'user' field is automatically set in the serializer
        serializer.save()

    def get_queryset(self):
        # Only return chat sessions for the currently authenticated user
        return ChatSession.objects.filter(user=self.request.user)

class ChatSessionDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = ChatSession.objects.all()
    serializer_class = ChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

# Message Views
class MessageList(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter messages by the session ID in the URL
        session_id = self.kwargs['session_id']
        return Message.objects.filter(session_id=session_id)

    def get_serializer_context(self):
        # Pass the session object to the serializer context
        context = super().get_serializer_context()
        session_id = self.kwargs['session_id']
        context['session'] = ChatSession.objects.get(id=session_id)
        return context

class MessageDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

# Create your views here.
# @api_view(['GET'])
# def search(request):
#     if request.method == 'GET':
#         try:
#             search = SearxSearchWrapper(searx_host="http://127.0.0.1:8080")
#             query = request.GET.get('query')
#             response = search.run(query)
#             return Response(response)
#         except Exception as e:
#             return Response(f'Error due to {e}',status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET'])
def search(request):
    if request.method == 'GET':
        try:
            query = request.GET.get('query')
            if not query:
                return Response('Query parameter is missing', status=status.HTTP_400_BAD_REQUEST)

            # Log the query for debugging
            print(f"Received query: {query}")
            

            search = SearxSearchWrapper(searx_host="http://127.0.0.1:8080")
            response = search.run(query)
            output={"response":response}
            print( "This is response", output)
            return Response(output)
        except Exception as e:
            print(f"Error: {str(e)}")  # Log the error for debugging
            return Response(f'Error due to {e}', status=status.HTTP_400_BAD_REQUEST)