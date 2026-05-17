from django.urls import path
from .views import ParqueCreateView, ParqueListView, ParqueDetailView, ParqueUpdateView, ParqueDeleteView, AddServicioToParqueView, RemoveServicioFromParqueView

app_name = "parks"

urlpatterns = [
    path('', ParqueListView.as_view()),
    path('create/', ParqueCreateView.as_view()),
    path('<int:id>/', ParqueDetailView.as_view()),
    path('<int:id>/update/', ParqueUpdateView.as_view()),
    path('<int:id>/delete/', ParqueDeleteView.as_view()),
    path('<int:id>/services/', AddServicioToParqueView.as_view()),
    path('<int:id>/services/<int:service_id>/', RemoveServicioFromParqueView.as_view()),
]