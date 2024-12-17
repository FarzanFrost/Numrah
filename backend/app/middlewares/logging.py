from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from time import time
from app.utils import get_logger

logger = get_logger(__name__)

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time()
        response = await call_next(request)
        exec_time = time() - start_time
        logger.info(f"Request: {request.method} {request.url} | Completed in {exec_time:.2f} seconds")

        return response
