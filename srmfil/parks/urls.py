from django.urls import path
from .views import ParqueCreateView, ParqueListView

app_name = "parks"

urlpatterns = [
    path('', ParqueListView.as_view()),
    path('create/', ParqueCreateView.as_view()),
]