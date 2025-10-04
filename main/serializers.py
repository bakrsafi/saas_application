from rest_framework import serializers
from .models import Building, Apartment, MediaApartment, PolygonJson


class PolygonSerializer(serializers.ModelSerializer):
    apartment_id = serializers.IntegerField(source="apartment.id", read_only=True)

    class Meta:
        model = PolygonJson
        fields = ['id', 'apartment_id', 'coords', 'data', 'created_at', 'updated_at']


class ApartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Apartment
        fields = ['id', 'unit_number', 'floor', 'area_m2', 'rooms_count', 'status', 'price', 'availability_date', 'created_at', 'updated_at']


class MediaWithPolygonsSerializer(serializers.ModelSerializer):
    polygons = PolygonSerializer(many=True, read_only=True)
    all_media_ids = serializers.SerializerMethodField()  # هاد الحقل الخاص بالمصفوفة تبع الid تبع كل الصورة الخاصة بمبنى واحد 
    class Meta:
        model = MediaApartment
        fields = ['id', 'media_type', 'url', 'alt_text', 'width', 'height', 'filesize_bytes', 'created_at', 'polygons','all_media_ids']        
        
    def get_all_media_ids(self, obj):
        building = obj.building
        return list(building.media.values_list('id', flat=True))


class BuildingSerializer(serializers.ModelSerializer):
    apartments = ApartmentSerializer(many=True, read_only=True)
    class Meta:
        model = Building
        fields = ['id', 'name', 'description', 'address', 'city', 'country', 'lat', 'lng', 'logo_media', 'brochure_media_id', 'building_image', 'created_at', 'updated_at', 'apartments']

class BuildingListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Building
        fields = ['id', 'name', 'description', 'address', 'city', 'country', 'lat', 'lng', 'logo_media', 'brochure_media_id', 'building_image', 'created_at', 'updated_at']
