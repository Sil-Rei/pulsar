from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from base.models import User
from ..serializers import User_serializer

#returns all data related to one user
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_data(request):
    username = request.user

    data = User.objects.raw(f"SELECT * FROM base_user WHERE username='{username}'")  # NO JOINS NEEDED, THE NESTED SERIALIZERS DO THE JOB
    seri = User_serializer(data, many=True)

    if(seri.data == []):
        return Response("Error, no such user or user has no portfolios", status=status.HTTP_404_NOT_FOUND)
    
    return Response(seri.data)



