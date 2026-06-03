from django.contrib import admin
from .models import Servicio

@admin.register(Servicio)
class ServicioAdmin(admin.ModelAdmin):

    list_display = ("id", "nombre", "descripcion")

    search_fields = ("nombre",)

    ordering = ("nombre",)

    list_per_page = 10
