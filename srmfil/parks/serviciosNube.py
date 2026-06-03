from imagekitio import ImageKit
from imagekitio.models.UploadFileRequestOptions import UploadFileRequestOptions
from django.conf import settings
import base64
import uuid

imagekit = ImageKit(
    public_key=settings.IMAGEKIT_PUBLIC_KEY,
    private_key=settings.IMAGEKIT_PRIVATE_KEY,
    url_endpoint=settings.IMAGEKIT_URL_ENDPOINT,
)

def upload_imagen_parque(file, id: int):
    file.seek(0)
    ext = file.name.split('.')[-1]
    file_name = f"parque_{id}_{uuid.uuid4().hex[:8]}.{ext}"
    
    file_content = file.read()
    file_b64 = f"data:image/{ext};base64," + base64.b64encode(file_content).decode('utf-8')
    
    options = UploadFileRequestOptions(
        folder=f"/parques/{id}/",
        is_private_file=False,
    )
    result = imagekit.upload_file(
        file=file_b64,
        file_name=file_name,
        options=options,
    )
    return result.url