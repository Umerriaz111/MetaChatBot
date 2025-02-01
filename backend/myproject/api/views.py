from django.shortcuts import render
import requests
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

## Azam this Method is Working This .Write like this in Langchain . 
## {
#     "detail": "Authentication credentials were not provided."
# }
# Remove Authentication credentials so far We Can Add that after Testing is Done
@api_view(['GET'])
def search(request):
    if request.method == 'GET':
        query = request.GET.get('query')
        if not query:
            return Response('Query parameter is missing', status=status.HTTP_400_BAD_REQUEST)

        # Log the query for debugging
        print(f"Received query: {query}")
        
        searxng_url = 'http://127.0.0.1:8080/search'
        data = {
            'q': query,
            'format': 'json',
            'category': 'general',  # Optional: specify categories if needed
        }
        
        try:
            # Send POST request to the search engine (SearxNG)
            response = requests.post(searxng_url, data=data)
            response.raise_for_status()  # This will raise an HTTPError for bad responses
            
            # Parse the response JSON
            results = response.json()
            
            # Return the results as a Response
            return Response(results, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            # Log the error and return a 500 status for request-related errors
            print(f"Request error: {str(e)}")
            return Response(f'Error during search request: {e}', status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except ValueError as e:
            # Handle JSON parsing errors
            print(f"JSON parsing error: {str(e)}")
            return Response(f'Error parsing response: {e}', status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            # Catch any other exceptions and log
            print(f"Unexpected error: {str(e)}")
            return Response(f'An unexpected error occurred: {e}', status=status.HTTP_500_INTERNAL_SERVER_ERROR)