# Marketing Video Generator

## Overview

This project provides a web application that generates marketing video scripts, converts the script into voice, and plays the audio in a video. The application is powered by a FastAPI backend and a frontend web interface.

## Project Structure

The project has the following directory structure:

```plaintext
.
│
├── frontend/
├── backend/
│   └── videos/
│       ├── mouse_pointer.png
│       ├── intro.mp4
│       ├── effect.webm
│       ├── ARIALBD.TTF
│       └── outro.mp4
│
├── .env         
├── docker-compose.yml
```

### Subfolders and Files
- `backend/app`: Contains the FastAPI application code.
- `backend/videos`: Contains video files for the project (`mouse_pointer.png`, `intro.mp4`, `outro.mp4`, `effect.webm`, `ARIALBD.TTF`).
- `.env`: File for environment variables.
- `docker-compose.yml`: Docker configuration file.
- `frontend`: The folder containing the frontend web application.

## Prerequisites

Ensure the following are installed on your machine:
- Docker (version 27.3.1)
- Docker Compose

## Setup Instructions

### 1. Clone the Repository
Clone the project repository to your local machine:

```bash
git clone https://github.com/FarzanFrost/Numrah.git
cd https://github.com/FarzanFrost/Numrah.git
```
## Environment Variables
Create a .env file in the root of the project with the following environment variables:

```bash
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
RUNWARE_API_KEY=your_runware_api_key
```
## Docker Setup
Make sure Docker is running on your machine. To build and run the project using Docker Compose, follow these steps:

### Build and Start the Application:

In the root project directory, run the following command:

```bash
docker-compose --env-file .env up
```

This will build the Docker containers and start the FastAPI backend and frontend web application.

Access the Application:

After the application starts, open your browser and go to:

```bash
http://localhost:3000/
```

## API Documentation
The backend API is powered by FastAPI, and the API documentation can be accessed at:
```bash
http://localhost:8000/docs
```