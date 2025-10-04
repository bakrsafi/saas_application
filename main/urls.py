from django.urls import path
from .views import HomePageAPI, BuildingListAPI
from .views import BuildingDetailView, MediaDetailView

urlpatterns = [
    path('api/home/', HomePageAPI.as_view(), name='api-home'),
    path('api/buildings/', BuildingListAPI.as_view(), name='api-buildings'),
    path('api/buildings/<int:id>/', BuildingDetailView.as_view(), name='building-detail'),
    path('api/buildings/<int:building_id>/media/<int:pk>/', MediaDetailView.as_view(), name='media-detail'),
]





