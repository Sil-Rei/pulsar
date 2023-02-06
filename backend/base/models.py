from django.db import models
from datetime import datetime  


# Portfolio db
class User(models.Model):
    username = models.CharField(max_length=25)
    member_since = models.DateField(default=datetime.now, blank=True, null=True)

    def __str__(self):
        return self.username
    
class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token_hash = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(default=datetime.now)
    message = models.TextField()
    portfolio_id = models.IntegerField(blank=True, null=True)
    already_read = models.BooleanField(default=False)
    is_important = models.BooleanField(default=False)

    def __str__(self):
        return self.user.username + ": " + str(self.timestamp)

class Vote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    portfolio = models.ForeignKey("Portfolio", on_delete=models.CASCADE)
    upvote = models.BooleanField()

    # makes sure a user can only vote once for a portfolio
    class Meta:
        unique_together = (('user', 'portfolio'),)

    def __str__(self):
        return self.user.username + " on " + self.portfolio.portfolio_name

class Portfolio(models.Model):
    # in cash -> users balance, added_funds -> field to track all added funds, can only go up
    portfolio_name = models.CharField(max_length=25)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="portfolios")
    in_cash = models.DecimalField(max_digits=15, decimal_places=2)
    added_funds = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, default=None)
    buy_fees = models.DecimalField(max_digits=6, decimal_places=2,null=True, blank=True, default=None)
    sell_fees = models.DecimalField(max_digits=6, decimal_places=2,null=True, blank=True, default=None)
    annual_fees = models.DecimalField(max_digits=6, decimal_places=2,null=True, blank=True, default=None)
    is_public = models.BooleanField(default=False)

    def upvotes(self):
        return Vote.objects.filter(portfolio=self, upvote=True).count()

    def downvotes(self):
        return Vote.objects.filter(portfolio=self, upvote=False).count()

    def __str__(self):
        return self.portfolio_name + ": " + self.user.username

class Position(models.Model):
    stock_symbol = models.CharField(max_length=12)
    buy_datetime = models.DateTimeField(default=datetime.now, blank=True)
    number_of_shares = models.IntegerField()
    purchase_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name="positions")

    def __str__(self):
        return self.stock_symbol + " " + self.portfolio.portfolio_name

# General db
class Stock_table(models.Model):
    ticker_symbol = models.CharField(max_length=12)
    first_date_entry = models.DateField(blank=True, null=True)
    
    def __str__(self):
        return self.ticker_symbol


class Stock_price_table(models.Model):
    ticker_symbol = models.CharField(max_length=12)
    date_time = models.DateTimeField(default=datetime.now, blank=True, null=True)
    price = models.FloatField()
