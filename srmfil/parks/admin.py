from django.contrib import admin
from .models import Parque, ImagenParque

@admin.register(Parque)
class ParqueAdmin(admin.ModelAdmin):

    list_display = (
        "id", "nombre", "direccion",
        "capacidad_maxima", "estatus_parque"
    )

    list_filter = ("estatus_parque", "tiene_cabanas")

    search_fields = ("nombre", "direccion")

    ordering = ("nombre",)

    list_per_page = 10


@admin.register(ImagenParque)
class ImagenParqueAdmin(admin.ModelAdmin):

    list_display = ("id", "parque", "url", "es_principal")

    list_filter = ("es_principal",)

    search_fields = ("parque__nombre",)

    list_per_page = 10