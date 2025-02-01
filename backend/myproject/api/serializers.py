from rest_framework import serializers
from django.contrib.auth.models import User
from .models import ChatSession, Message

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class ChatSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatSession
        fields = ['id', 'session_name', 'created_at']  # Don't include 'user' here

    def create(self, validated_data):
        # Automatically set the 'user' field to the currently authenticated user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'user_message', 'created_at']  # Exclude 'session' and 'chatbot_response'

    def create(self, validated_data):
        # Automatically set the 'session' field based on the URL parameter
        validated_data['session'] = self.context['session']
        # Generate the chatbot response (replace this with your chatbot logic)
        validated_data['chatbot_response'] = "This is a sample response."
        return super().create(validated_data)