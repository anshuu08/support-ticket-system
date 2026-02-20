from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Ticket, Comment


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff']


class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    author_is_staff = serializers.BooleanField(source='author.is_staff', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'ticket', 'author', 'author_username', 'author_is_staff',
                  'content', 'created_at', 'is_internal']
        read_only_fields = ['author', 'created_at', 'author_username', 'author_is_staff']


class TicketSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True, allow_null=True)
    comments = CommentSerializer(many=True, read_only=True)
    comment_count = serializers.SerializerMethodField()
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = Ticket
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'owner', 'owner_username',
                            'assigned_to_username', 'comment_count', 'is_overdue']

    def get_comment_count(self, obj):
        return obj.comments.count()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
