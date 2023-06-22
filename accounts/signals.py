from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import *



#Django Signals

@receiver(post_save, sender=User)
def post_save_created_profile_receiver(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
    else:
        try:
            profile = UserProfile.objects.get(user=instance)
            profile.save()
        except:
            #Create user profile if not in database
            UserProfile.objects.create(user=instance)

@receiver(pre_save, sender=User)
def pre_save_profile_receiver(sender, instance, **kwargs):
    print(instance.username)




# post_save.connect(post_save_created_profile_receiver, sender=User)