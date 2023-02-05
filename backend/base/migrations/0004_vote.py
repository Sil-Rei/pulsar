# Generated by Django 4.1.4 on 2023-01-18 18:57

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0003_portfolio_is_public'),
    ]

    operations = [
        migrations.CreateModel(
            name='Vote',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('upvote', models.BooleanField()),
                ('portfolio', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='base.portfolio')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='base.user')),
            ],
            options={
                'unique_together': {('user', 'portfolio')},
            },
        ),
    ]
