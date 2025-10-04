
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Building, Apartment
from .serializers import BuildingSerializer, ApartmentSerializer
from rest_framework import generics
from .models import Building, MediaApartment
from .serializers import BuildingSerializer, MediaWithPolygonsSerializer, BuildingListSerializer


class HomePageAPI(APIView):
    def get(self, request):
        buildings = Building.objects.all().order_by('-created_at')[:4]
        serializer = BuildingSerializer(buildings, many=True)
        return Response({'buildings': serializer.data})

class BuildingListAPI(APIView):
    def get(self, request):
        # مشان يجيب كلشي مدن متاحة 
        cities = Building.objects.values_list("city", flat=True).distinct()
        buildings = Building.objects.all()
        serializer = BuildingListSerializer(buildings, many=True)
        return Response({'buildings': serializer.data, 'cities': list(cities)})



# --------- Building Details + Apartments ---------
class BuildingDetailView(generics.RetrieveAPIView):
    queryset = Building.objects.all()
    serializer_class = BuildingSerializer
    lookup_field = 'id'

# --------- Media Details + Polygons ---------
class MediaDetailView(generics.RetrieveAPIView):
    queryset = MediaApartment.objects.all()
    serializer_class = MediaWithPolygonsSerializer

    def get_queryset(self):
        building_id = self.kwargs['building_id']
        return MediaApartment.objects.filter(building_id=building_id)
