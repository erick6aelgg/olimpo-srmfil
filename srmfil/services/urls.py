from django.urls import path
from .views import ServicioCreateView, ServicioListView, ServicioUpdateView, ServicioDeleteView

app_name = "services"

urlpatterns = [
    path('', ServicioListView.as_view()),
    path('create/', ServicioCreateView.as_view()),
    path('<int:id>/update/', ServicioUpdateView.as_view()),
    path('<int:id>/delete/', ServicioDeleteView.as_view()),
]