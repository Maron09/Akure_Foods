# Generated by Django 4.2.3 on 2024-04-25 20:31

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0006_userprofile_location'),
    ]

    operations = [
        migrations.RenameField(
            model_name='userprofile',
            old_name='location',
            new_name='locations',
        ),
    ]
