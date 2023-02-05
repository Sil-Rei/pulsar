from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response 
from ..serializers import RegisterSerializer
from base.models import User, Notification

# Login/ Register API
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username

        return token

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

@api_view(["POST"])
def register_user(request):
    print(request.data)
    serializer = RegisterSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()
        User.objects.create(username=request.data["username"])
        user = User.objects.get(username=request.data["username"])
        Notification.objects.create(user=user, message=f"Welcome {user.username} to polar.! \nLook around or go to the portfolio tab to create your own today")
   
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  