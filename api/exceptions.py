from fastapi import HTTPException

class APIException(HTTPException):
    def __init__(self, status_code: int, message: str):
        super().__init__(status_code=status_code, detail=message)
        self.message = message

class NotFoundError(APIException):
    def __init__(self, message: str = "Not found"):
        super().__init__(status_code=404, message=message)

class ForbiddenError(APIException):
    def __init__(self, message: str = "Forbidden"):
        super().__init__(status_code=403, message=message)
