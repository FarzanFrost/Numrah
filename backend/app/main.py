from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.middlewares import LoggingMiddleware
from app.routes import script_generation, voice_selection, image_generation, video_generation
from fastapi.staticfiles import StaticFiles


app = FastAPI(title="MVG APPLICATION", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React development server
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Register middleware
app.add_middleware(LoggingMiddleware)

# Mount the video directory
app.mount("/static", StaticFiles(directory='./videos'), name="videos")

# Add routes
app.include_router(script_generation.router)
app.include_router(voice_selection.router)
app.include_router(image_generation.router)
app.include_router(video_generation.router)


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    return {"message": "Welcome to the MVG application!"}
