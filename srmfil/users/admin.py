from django.contrib import admin
from .models import Usuario

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):

    list_display = (
        "id", "email", "first_name",
        "apellido_p", "tipo_usuario"
    )

    list_filter = ("tipo_usuario",)

    search_fields = ("email", "first_name")

    ordering = ("email",)

    list_per_page = 10