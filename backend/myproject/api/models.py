from django.db import models
from django.contrib.auth.models import User
import uuid

class ChatSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    session_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    vector_db_name = models.CharField(max_length=255, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.vector_db_name:
            self.vector_db_name = f"db_{uuid.uuid4().hex[:8]}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.session_name} (User: {self.user.username})"

class Message(models.Model):
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE)
    user_message = models.TextField()
    chatbot_response = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    message_type = models.CharField(max_length=20, choices=[('searching', 'Searching'), ('scraping', 'Scraping')], default='searching')

    def __str__(self):
        return f"Message {self.id} in Session {self.session.id}"