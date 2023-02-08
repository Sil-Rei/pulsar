import base64
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response 
from ..serializers import RegisterSerializer
from base.models import User, Notification, PasswordResetToken, EmailValidationToken
from django.contrib.auth.models import User as Django_user
from ..emailutils import Emailutils
import os, bcrypt, requests
from django.utils import timezone



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
    
    if len(Django_user.objects.filter(email=request.data["email"])) != 0:
        return Response("a user with that email already exists", status=status.HTTP_400_BAD_REQUEST) 

    serializer = RegisterSerializer(data=request.data)

    if "recaptchaResponse" not in request.data:
        return Response("unvalid Captcha", status=status.HTTP_401_UNAUTHORIZED)
    captcha_response = request.data["recaptchaResponse"]

    if not validate_captcha(captcha_response):
        return Response({"error": "captcha validation failed"}, status=status.HTTP_400_BAD_REQUEST)
    
    if serializer.is_valid():
        serializer.save()
        user = User.objects.create(username=request.data["username"])
        user.save()
        django_user = Django_user.objects.get(id=user.id)
        Notification.objects.create(user=user, message=f"Don't forget to verify your email", is_important=True)
        Notification.objects.create(user=user, message=f"Welcome {user.username} to polar.! \nLook around or go to the portfolio tab to create your own today")

        #send verification email
        token = str(AccessToken.for_user(django_user))
        
        link = str(os.getenv("APIURL")) + "user/validate_email" +"?token=" + str(token)

        to = django_user.email
        subject = "pulsar. - Verify Your Email Address"
        body = f"Dear {user.username},\n\nThank you for signing up for pulsar. To start using all of our features, please verify your email address by clicking on the link below.\n\nVerification Link: {link}\n\nIf you didn't sign up for Pulsar, you can safely ignore this email.\n\nBest regards,\nYour pulsar. Team"

        EmailValidationToken.objects.create(user=User.objects.get(id=user.id), token=token)
        Emailutils.send_email(to, subject, body)
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
def validate_email(request):
    token = str(request.data["token"])
    if not token:
        return Response("Token missing.", status=status.HTTP_400_BAD_REQUEST)
    
    # compare the token and the hash in the database
    
    try:
        email_token = EmailValidationToken.objects.get(token=token)
    except:
        return Response("Invalid token", status=status.HTTP_400_BAD_REQUEST)
    
    # check if token still valid
    if (timezone.now() - email_token.created_at).total_seconds() > 5 * 60:
        email_token.delete()
        return Response("Token expired", status=status.HTTP_400_BAD_REQUEST)
    
    user = email_token.user
    user.verified_email = True
    user.save()
    email_token.delete()
    return Response("Email verified.", status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def resend_verification_email(request):
        #send verification email
        user = User.objects.get(id=request.user.id)
        django_user = Django_user.objects.get(id=user.id)
        token = str(AccessToken.for_user(django_user))
        
        link = str(os.getenv("APIURL")) + "user/validate_email" +"?token=" + str(token)

        to = django_user.email
        subject = "pulsar. - Verify Your Email Address"
        body = f"Dear {user.username},\n\nThank you for signing up for pulsar. To start using all of our features, please verify your email address by clicking on the link below.\n\nVerification Link: {link}\n\nIf you didn't sign up for Pulsar, you can safely ignore this email.\n\nBest regards,\nYour pulsar. Team"
        EmailValidationToken.objects.filter(user=user).delete()
        EmailValidationToken.objects.create(user=User.objects.get(id=user.id), token=token)
        Emailutils.send_email(to, subject, body)
        return Response("resend mail", status=status.HTTP_202_ACCEPTED)

@api_view(["GET"])
def get_captcha_public_key(request):
    return Response(str(os.getenv("RECAPTCHA_PUBLIC_KEY")))


@api_view(["POST"])
def reset_password(request):
    email = request.data["email"]

    try:
        user = Django_user.objects.get(email=email)
    except:
        print("Unkown email")
        return Response("Reset email send, if an account with that email exists.", status=status.HTTP_200_OK)

    token = str(AccessToken.for_user(user))
    hashed_token = str(bcrypt.hashpw(token.encode('utf-8'), b'$2b$12$8UTcpujwcZEtbalsz9IxMO'))
    print("generated token:" + token)
    print("hashed token:" + hashed_token + "\n")
    PasswordResetToken.objects.create(user=User.objects.get(id=user.id), token_hash=hashed_token)

    reset_link = str(os.getenv("APIURL")) + "user/reset-password" +"?token=" + str(token)

    email_subject = "pulsar. Password reset request"
    emai_body = f""" It seems like you forgot your password and requested a password reset.\n
    Please click that link to reset your password: {reset_link}\n If you didn't request a password reset you can ignore that email.\ngreetings, your pulsar. team"""
    Emailutils.send_email(email, email_subject, emai_body)

    return Response("Reset email send, if an account with that email exists.", status=status.HTTP_200_OK)


@api_view(["POST"])
def reset_password_confirm(request):
    token = request.data["token"]
    if not token:
        return Response("Token missing.", status=status.HTTP_400_BAD_REQUEST)
    
    # compare the token and the hash in the database
    hashed_token = bcrypt.hashpw(token.encode('utf-8'), b'$2b$12$8UTcpujwcZEtbalsz9IxMO')
    try:
        password_reset_token = PasswordResetToken.objects.get(token_hash=hashed_token)
    except:
        return Response("Invalid token", status=status.HTTP_400_BAD_REQUEST)
    
    # check if token still valid
    if (timezone.now() - password_reset_token.created_at).total_seconds() > 3 * 60:
        password_reset_token.delete()
        return Response("Token expired", status=status.HTTP_400_BAD_REQUEST)
    
    user = password_reset_token.user
    django_user = Django_user.objects.get(id=user.id)

    if len(request.data["password"]) < 8 or len(request.data["password"]) > 48:
        return Response("Invalid password length", status=status.HTTP_400_BAD_REQUEST)
    
    django_user.set_password(request.data["password"])
    django_user.save()
    password_reset_token.delete()
    
    return Response("password updated", status=status.HTTP_200_OK)