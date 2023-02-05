# Generated by Django 4.1.4 on 2023-01-08 14:23

import datetime
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Portfolio',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('portfolio_name', models.CharField(max_length=25)),
                ('in_cash', models.DecimalField(decimal_places=2, max_digits=15)),
                ('buy_fees', models.DecimalField(blank=True, decimal_places=2, default=None, max_digits=6, null=True)),
                ('sell_fees', models.DecimalField(blank=True, decimal_places=2, default=None, max_digits=6, null=True)),
                ('annual_fees', models.DecimalField(blank=True, decimal_places=2, default=None, max_digits=6, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Stock_price_table',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ticker_symbol', models.CharField(max_length=12)),
                ('date_time', models.DateTimeField(blank=True, default=datetime.datetime.now, null=True)),
                ('price', models.FloatField()),
            ],
        ),
        migrations.CreateModel(
            name='Stock_table',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ticker_symbol', models.CharField(max_length=12)),
                ('first_date_entry', models.DateField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('username', models.CharField(max_length=25)),
            ],
        ),
        migrations.CreateModel(
            name='Position',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('stock_symbol', models.CharField(max_length=12)),
                ('buy_datetime', models.DateTimeField(blank=True, default=datetime.datetime.now)),
                ('number_of_shares', models.IntegerField()),
                ('purchase_price', models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True)),
                ('portfolio', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='positions', to='base.portfolio')),
            ],
        ),
        migrations.AddField(
            model_name='portfolio',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='portfolios', to='base.user'),
        ),
    ]
