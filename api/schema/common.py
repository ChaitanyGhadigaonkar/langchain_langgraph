from pydantic import BaseModel

class BaseAPIResponse(BaseModel):
    success: bool
    message: str
