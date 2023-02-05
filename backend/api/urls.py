from django.urls import path
from . import views
from .views import MyTokenObtainPairView

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path("user/data", views.get_user_data),
    path("user/portfolio_data", views.get_portfolio_data),
    path("user/add_portfolio", views.add_portfolio),
    path("user/delete_portfolio", views.delete_portfolio),
    path("user/add_stock", views.add_stock),
    path("user/delete_stock", views.delete_stock),
    path("user/notifications", views.get_user_notifications),
    path("user/delete_notification", views.delete_user_notification),
    path("user/mark_notifications_read", views.mark_notifications_read),
    path("check_stock_price", views.check_stock_price),
    path("user/maingraph_data", views.get_maingraph_data),
    path("user/profile/toggle_publicness", views.toggle_portfolio_publicness),

    path("get_public_portfolios", views.get_public_portfolios),
    path("get_public_portfolio", views.get_public_portfolio_data),
    path("get_public_profile", views.get_public_profile),
    path("public_maingraph_data", views.get_public_maingraph_data),
    path("community/vote", views.vote_portfolio),
    
    path("user/register", views.register_user),

    path("all_stock_prices/", views.get_all_stock_prices),
    path("all_stock_symbols/", views.get_all_stock_symbols),
    path("stock_price_data/<ticker_symbol>", views.stock_price_data),
]
