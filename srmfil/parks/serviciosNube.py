from imagekitio import ImageKit
from imagekitio.models.UploadFileRequestOptions import UploadFileRequestOptions
from django.conf import settings
import uuid

imagekit = ImageKit(
    public_key=settings.IMAGEKIT_PUBLIC_KEY,
    private_key=settings.IMAGEKIT_PRIVATE_KEY,
    url_endpoint=settings.IMAGEKIT_URL_ENDPOINT,
)

def upload_imagen_parque(file, parque_id: int):
    """
    Sube el archivo a ImageKit y retorna solo la url
    """
    file_name = f"parque_{parque_id}_{uuid.uuid4().hex[:8]}"

    options = UploadFileRequestOptions(
        folder=f"/parques/{parque_id}/",
        is_private_file=False,)
    
    result = imagekit.upload_file(
        file=file.read(),
        file_name=file_name,
        options=options,)
    return result.url  # Solo necesitamos la url