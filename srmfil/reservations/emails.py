from django.core.mail import send_mail
from django.conf import settings


def enviar_confirmacion_reservacion(reservacion):
    """
    Envía un correo de confirmación al usuario cuando se crea una reservación.
    """
    usuario = reservacion.usuario
    parque = reservacion.parque

    asunto = f"Confirmación de reservación #{reservacion.id} — {parque.nombre}"

    mensaje = f"""
Hola {usuario.first_name},

Tu reservación ha sido confirmada exitosamente. Aquí están los detalles:

  Parque:           {parque.nombre}
  Dirección:        {parque.direccion}
  Tipo de visita:   {reservacion.get_tipo_visita_display()}
  Fecha de inicio:  {reservacion.fecha_inicio}
  Fecha de fin:     {reservacion.fecha_fin}
  Personas:         {reservacion.numero_personas}
  Estado:           {reservacion.get_estado_display()}

¡Te esperamos!
El equipo del Festival Internacional de Luciérnagas
    """.strip()

    send_mail(
        subject=asunto,
        message=mensaje,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[usuario.email],
        fail_silently=False,
    )


def enviar_notificacion_cancelacion(reservacion):
    """
    Envía un correo al usuario cuando su reservación es cancelada.
    """
    usuario = reservacion.usuario
    parque = reservacion.parque

    asunto = f"Tu reservación #{reservacion.id} ha sido cancelada"

    mensaje = f"""
Hola {usuario.first_name},

Te informamos que tu reservación ha sido cancelada:

  Parque:           {parque.nombre}
  Tipo de visita:   {reservacion.get_tipo_visita_display()}
  Fecha de inicio:  {reservacion.fecha_inicio}
  Fecha de fin:     {reservacion.fecha_fin}


El equipo del Festival Internacional de Luciérnagas
    """.strip()

    send_mail(
        subject=asunto,
        message=mensaje,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[usuario.email],
        fail_silently=False,
    )