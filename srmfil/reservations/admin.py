from django.contrib import admin
from .models import Reservacion

@admin.register(Reservacion)
class ReservacionAdmin(admin.ModelAdmin):

    list_display = (
        "id", "usuario", "parque",
        "fecha_inicio", "fecha_fin", "estado"
    )

    list_filter = ("estado",)

    search_fields = ("usuario__email", "parque__nombre")

    ordering = ("-fecha_inicio",)

    list_per_page = 10