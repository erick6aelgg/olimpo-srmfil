from django.urls import path
from .views import ParqueCreateView, ParqueListView, ParqueDetailView, ParqueUpdateView, ParqueDeleteView

app_name = "parks"

urlpatterns = [
    path('', ParqueListView.as_view()),
    path('create/', ParqueCreateView.as_view()),
    path('<int:id>/', ParqueDetailView.as_view()),
    path('<int:id>/update/', ParqueUpdateView.as_view()),
    path('<int:id>/delete/', ParqueDeleteView.as_view()),
]