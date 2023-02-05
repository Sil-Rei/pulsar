from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response 
from ..serializers import RegisterSerializer
from base.models import User, Notification
import requests
import os

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

def validate_captcha(captcha_response):
    url = "https://www.google.com/recaptcha/api/siteverify"
    params = {
        "secret": str(os.getenv("RECAPTCHA_PRIVATE_KEY")),
        "response": captcha_response
    }
    response = requests.post(url, params=params)
    result = response.json()
    return result["success"]

@api_view(["POST"])
def register_user(request):
    print(request.data)
    serializer = RegisterSerializer(data=request.data)

    if "recaptchaResponse" not in request.data:
        return Response("Unvalid Captcha", status=status.HTTP_401_UNAUTHORIZED)
    captcha_response = request.data["recaptchaResponse"]

    if not validate_captcha(captcha_response):
        return Response({"error": "Captcha validation failed"}, status=status.HTTP_400_BAD_REQUEST)
    
    if serializer.is_valid():
        serializer.save()
        User.objects.create(username=request.data["username"])
        user = User.objects.get(username=request.data["username"])
        Notification.objects.create(user=user, message=f"Welcome {user.username} to polar.! \nLook around or go to the portfolio tab to create your own today")
   
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
def get_captcha_public_key(request):
    return Response(str(os.getenv("RECAPTCHA_PUBLIC_KEY")))