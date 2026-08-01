from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID

class MessageSchema(BaseModel):
    id: UUID
    conversation_id: UUID
    role: str
    content: dict
    parent_id: UUID | None = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class SendMessageRequest(BaseModel):
    text: str
