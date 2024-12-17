from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.middlewares import LoggingMiddleware
from app.routes import script_generation

app = FastAPI(title="MVG APPLICATION", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React development server
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Register middleware
app.add_middleware(LoggingMiddleware)

# Add routes
app.include_router(script_generation.router)


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    return {"message": "Welcome to the MVG application!"}
