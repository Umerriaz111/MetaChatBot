from rest_framework import serializers
from .models import User,ChatSession, Message

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class ChatSessionSerializer(serializers.ModelSerializer):
    # This field will now expect a user ID from the frontend.
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = ChatSession
        fields = ['id', 'user', 'session_name', 'created_at']

    def create(self, validated_data):
        # No longer automatically setting the user. The provided user ID is used.
        return super().create(validated_data)

class MessageSerializer(serializers.ModelSerializer):
    # Add a session field that expects a primary key
    session = serializers.PrimaryKeyRelatedField(queryset=ChatSession.objects.all())

    class Meta:
        model = Message
        # Now include the session field in the serializer output and input.
        fields = ['id', 'user_message', 'session', 'created_at', 'chatbot_response']
        read_only_fields = ['chatbot_response', 'created_at']

    def create(self, validated_data):
        # Generate the chatbot response (customize as needed)
        validated_data['chatbot_response'] = "This is a sample response."
        return super().create(validated_data)