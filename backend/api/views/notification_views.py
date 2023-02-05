from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from base.models import User, Notification
from ..serializers import NotificationSerializer

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_notifications(request):
    user = User.objects.get(id=request.user.id)
    notifications = Notification.objects.filter(user=user)
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_user_notification(request):
    user = User.objects.get(id=request.user.id)
    Notification.objects.filter(user=user, id=request.data["notification_id"]).delete()
    return Response("Deleted notification")

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def mark_notifications_read(request):
    user = User.objects.get(id=request.user.id)
    Notification.objects.filter(user=user, already_read=False).update(already_read=True)
    return Response("marked all as read")