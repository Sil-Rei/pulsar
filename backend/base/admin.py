from django.contrib import admin
from base.models import User, Portfolio, Position, Stock_table, Stock_price_table, Vote, Notification, PasswordResetToken

# Register your models here.
admin.site.register(User)
admin.site.register(Portfolio)
admin.site.register(Position)
admin.site.register(Vote)
admin.site.register(Stock_table)
admin.site.register(Stock_price_table)
admin.site.register(Notification)
admin.site.register(PasswordResetToken)