from rest_framework import serializers
from base.models import Stock_table, Stock_price_table, Portfolio, Position, Notification
from base.models import User as Costum_user
from django.contrib.auth.models import User 

from django.contrib.auth import get_user_model
UserModel = get_user_model()
class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs={'password': {'write_only': True}}

    def create(self, validated_data):
        print("CREATED")
        user=User.objects.create_user(validated_data['username'],validated_data['email'],validated_data['password'])

        return user

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"


class Position_serializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = "__all__"

class Portfolio_serializer(serializers.ModelSerializer):
    positions = Position_serializer(many=True)
    class Meta:
        model = Portfolio
        fields = "__all__"

class Portfolio_POST_serializer(serializers.ModelSerializer):
    class Meta:
        model = Portfolio
        fields = "__all__"

class User_serializer(serializers.ModelSerializer):
    portfolios = Portfolio_serializer(many=True)
    class Meta:
        model = Costum_user
        #fields = ("username", "portfolio_id", "in_cash", "stock_id", "buy_datetime", "number_of_shares", "stock_symbol")
        fields = "__all__"

class Stock_table_serializer(serializers.ModelSerializer):
    class Meta:
        model = Stock_table
        fields = "__all__"


class Stock_price_table_serializer(serializers.ModelSerializer):
    class Meta:
        model = Stock_price_table
        fields = "__all__"