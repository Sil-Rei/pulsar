# Generated by Django 4.1.4 on 2023-01-17 19:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0002_portfolio_added_funds'),
    ]

    operations = [
        migrations.AddField(
            model_name='portfolio',
            name='is_public',
            field=models.BooleanField(default=False),
        ),
    ]