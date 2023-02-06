from django.urls import path
from .views import *


from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path("captcha_publickey", get_captcha_public_key),

    path("user/data", get_user_data),
    path("user/reset_password", reset_password),
    path("user/reset_password_confirm", reset_password_confirm, name="reset_password_confirm"),
    path("user/portfolio_data", get_portfolio_data),
    path("user/add_portfolio", add_portfolio),
    path("user/delete_portfolio", delete_portfolio),
    path("user/add_stock", add_stock),
    path("user/delete_stock", delete_stock),
    path("user/notifications", get_user_notifications),
    path("user/delete_notification", delete_user_notification),
    path("user/mark_notifications_read", mark_notifications_read),
    path("check_stock_price", check_stock_price),
    path("user/maingraph_data", get_maingraph_data),
    path("user/profile/toggle_publicness", toggle_portfolio_publicness),

    path("get_public_portfolios", get_public_portfolios),
    path("get_public_portfolio", get_public_portfolio_data),
    path("get_public_profile", get_public_profile),
    path("public_maingraph_data", get_public_maingraph_data),
    path("community/vote", vote_portfolio),
    
    path("user/register", register_user),
    
    path("all_stock_prices/", get_all_stock_prices),
    path("all_stock_symbols/", get_all_stock_symbols),
    path("stock_price_data/<ticker_symbol>", stock_price_data),
]
