from django.contrib import admin

# Register your models here.


from .models import Building, Apartment, MediaApartment, PolygonJson

admin.site.register(Building)
admin.site.register(Apartment)
admin.site.register(MediaApartment)
admin.site.register(PolygonJson)