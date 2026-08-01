from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID

from api.schema.common import BaseAPIResponse
from api.schema.messages import MessageSchema


class ConversationSchema(BaseModel):
    id: UUID
    title: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class GetConversationsResponse(BaseAPIResponse):
    conversations: list[ConversationSchema]

class CreateConversationResponse(BaseAPIResponse):
    conversation: ConversationSchema

class GetConversationResponse(BaseAPIResponse):
    conversation: ConversationSchema
    messages: list[MessageSchema]
