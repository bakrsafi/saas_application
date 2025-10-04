

from django.db import models
from django.contrib.postgres.fields import JSONField

from django.db import models


# ========= Users =========
# مبدئياً ما في تفاصيل users عندك، 
# فممكن تعتمد على auth.User الافتراضي
# أو تعمل موديل مخصص لاحقاً.


# ========= Buildings =========
class Building(models.Model):
    id = models.BigAutoField(primary_key=True)
    '''
    owner = models.ForeignKey(
        "auth.User",  # إذا عندك موديل Users مخصص، بدّك تغيره هون
        on_delete=models.CASCADE,
        related_name="buildings"
    )'''
    name = models.TextField()
    description = models.TextField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    city = models.TextField(blank=True, null=True)
    country = models.TextField(blank=True, null=True)
    lat = models.FloatField(blank=True, null=True)
    lng = models.FloatField(blank=True, null=True)
    logo_media = models.BigIntegerField(blank=True, null=True)  # ممكن تعمل FK لـ Media لاحقاً
    brochure_media_id = models.BigIntegerField(blank=True, null=True)
    building_image = models.ImageField(upload_to='buildings/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "buildings"

    def __str__(self):
        return self.name


# ========= Apartments =========
from django.db.models import Max

class Apartment(models.Model):
    STATUS_CHOICES = [
        ("available", "Available"),
        ("reserved", "Reserved"),
        ("sold", "Sold"),
    ]

    id = models.BigAutoField(primary_key=True)
    building = models.ForeignKey(
        Building,
        on_delete=models.CASCADE,
        related_name="apartments"
    )
    unit_number = models.TextField(blank=True, null=True)  # ex: "A-12"
    floor = models.IntegerField(blank=True, null=True)
    area_m2 = models.DecimalField(max_digits=9, decimal_places=2, blank=True, null=True)
    rooms_count = models.IntegerField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="available"
    )
    price = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)
    availability_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "apartments"

    def save(self, *args, **kwargs):
        if not self.unit_number:  # لو ما دخلوها المانيوال
            last_unit = Apartment.objects.filter(building=self.building).aggregate(
                Max("id")
            )["id__max"] or 0
            next_number = last_unit + 1
            self.unit_number = f"A-{next_number}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Apt {self.unit_number or self.id} - {self.building.name}"


# ========= Media (images / videos / pdf / panorama) =========
class MediaApartment(models.Model):
    MEDIA_TYPES = [
        ("image", "Image"),
        ("panorama", "Panorama"),
        ("pdf", "PDF"),
        ("video", "Video"),
    ]

    id = models.BigAutoField(primary_key=True)
    building = models.ForeignKey(
        Building,
        on_delete=models.CASCADE,
        related_name="media"
    )
    media_type = models.CharField(max_length=20, choices=MEDIA_TYPES)
    url = models.ImageField(upload_to="buildings/")
    alt_text = models.TextField(blank=True, null=True)
    width = models.IntegerField(blank=True, null=True)
    height = models.IntegerField(blank=True, null=True)
    filesize_bytes = models.BigIntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "media_apartment"

    def __str__(self):
        return f"{self.media_type} - {self.building.name}"


# ========= Polygons (interactive clickable areas) =========
class PolygonJson(models.Model):
    id = models.BigAutoField(primary_key=True)
    apartment = models.ForeignKey(
        Apartment,
        on_delete=models.CASCADE,
        related_name="polygons"
    )
    media_apartment = models.ForeignKey(
        MediaApartment,
        on_delete=models.CASCADE,
        related_name="polygons"
    )
    coords = models.JSONField()  # [{"x":0.12,"y":0.34}, ...]
    data = models.JSONField(default=dict, blank=True, null=True)  # {display_color, z_index, tooltip, meta}
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "polygons_json"

    def __str__(self):
        return f"Polygon for Apt {self.apartment.unit_number} ({self.media_apartment.media_type})"
