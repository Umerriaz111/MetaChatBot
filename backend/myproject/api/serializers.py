from rest_framework import serializers
from django.contrib.auth.models import User
from .models import ChatSession, Message

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class ChatSessionSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(write_only=True, required=False)  # Add user_id field

    class Meta:
        model = ChatSession
        fields = ['id', 'session_name', 'created_at', 'user_id']  # Include user_id

    def create(self, validated_data):
        # Check if user_id is provided; otherwise, use the authenticated user
        user_id = validated_data.pop('user_id', None)
        print(f'user_id = {user_id}')
        if not user_id:
            user_id = self.context['request'].user.id

        validated_data['user'] = User.objects.get(id=user_id)  # Set the user field
        return super().create(validated_data)


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'user_message', 'chatbot_response', 'created_at']  # Exclude 'session' and 'chatbot_response'

    def create(self, validated_data):
        # Automatically set the 'session' field based on the URL parameter
        validated_data['session'] = self.context['session']
        # Generate the chatbot response (replace this with your chatbot logic)
        validated_data['chatbot_response'] = "This is a sample response."
        return super().create(validated_data)