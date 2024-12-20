from moviepy import (
    VideoFileClip,
    AudioFileClip,
    ImageClip,
    concatenate_videoclips,
    CompositeVideoClip,
    ImageSequenceClip,
)
from moviepy.video.fx import CrossFadeIn, CrossFadeOut
from fastapi import APIRouter
import os
import numpy as np
from math import ceil
from PIL import Image, ImageDraw, ImageFilter, ImageSequence
from app.models import VideosInput, Video
from itertools import product
from elevenlabs import ElevenLabs
from app.config import Settings
from io import BytesIO
import base64
from multiprocessing import Pool
from io import BytesIO
from pydub import AudioSegment
import uuid
from typing import List


router = APIRouter(prefix='/video_generation', tags=["Videos"])
settings = Settings()
directory = './videos/'


def add_rounded_border(image, border_size=10, border_color=(0, 0, 0), corner_radius=20):
    # Step 1: Create a new image with a larger size for the border
    bordered_width = image.width + 2 * border_size
    bordered_height = image.height + 2 * border_size
    
    # Create the final image with transparent background
    final_image = Image.new("RGBA", (bordered_width, bordered_height), (0, 0, 0, 0))
    
    # Step 2: Create a mask for the rounded corners of the border
    border_mask = Image.new("L", (bordered_width, bordered_height), 0)
    draw_border = ImageDraw.Draw(border_mask)
    draw_border.rounded_rectangle(
        [(0, 0), (bordered_width, bordered_height)],
        corner_radius, fill=255)
    
    # Step 3: Create the border and apply rounded corners to it
    border = Image.new("RGBA", (bordered_width, bordered_height), border_color)
    
    # Step 4: Apply the rounded border to the final image
    final_image.paste(border, (0, 0), border_mask)  # Apply border with rounded corners
    
    # Step 5: Create a mask for the rounded corners of the image
    image_mask = Image.new("L", (image.width, image.height), 0)
    draw_image = ImageDraw.Draw(image_mask)
    draw_image.rounded_rectangle(
        [(0, 0), (image.width, image.height)],
        corner_radius, fill=255)
    
    # Step 6: Paste the original image into the center of the final image
    final_image.paste(image, (border_size, border_size), image_mask)
    
    return final_image

def decode_base64_image(base64_str):
    """Decodes a base64 string into a Pillow image."""
    image_data = base64.b64decode(base64_str)
    return Image.open(BytesIO(image_data))

def create_static_image(background_image_base64, preview_image_base64, small_image_base64_lists):
    # Load background image
    background = decode_base64_image(background_image_base64).convert("RGBA")
    
    # Resize background if necessary
    background = background.resize((1280, 720))  # Assuming a 1280x720 resolution video
    background = background.filter(ImageFilter.GaussianBlur(10))

    # Add small images on the right side
    y_offset = 50  # Starting y-position for small images
    small_image_height = 100  # Fixed height for small images
    small_image_spacing = 25  # Spacing between small images

    for i, small_img_base64 in enumerate(small_image_base64_lists):
        small_img = decode_base64_image(small_img_base64).convert("RGBA")
        small_img = small_img.resize((100, small_image_height))  # Resize to small size
        
        small_img_with_effects = add_rounded_border(small_img)

        x_position = background.width - 200  # Align to right
        y_position = y_offset + i * (small_image_height + small_image_spacing)
        background.paste(small_img_with_effects, (x_position, y_position), small_img_with_effects)  # Paste with transparency

    # Add the preview image to the center
    preview_img = decode_base64_image(preview_image_base64).convert("RGBA")
    preview_img = preview_img.resize((500, 500))  # Resize to a suitable size
    
    preview_img_with_effects = add_rounded_border(preview_img)

    preview_position = (
        (background.width - preview_img_with_effects.width) // 2,
        (background.height - preview_img_with_effects.height) // 2,
    )
    background.paste(preview_img_with_effects, preview_position, preview_img_with_effects)


    return background 

def create_mouse_pointer_animation(click_position, pointer_image_path, duration=0.5, fps=24):
    click_position = (click_position[0] + 50, click_position[1] + 50)
    """
    Create a simple mouse pointer animation that moves from start_position to end_position.
    """
    pointer_img = Image.open(pointer_image_path).convert("RGBA")
    pointer_img = pointer_img.resize((20, 20))
    pointer_clip = ImageClip(np.array(pointer_img), duration=duration).with_fps(fps)

    # Animate the pointer from start_position to end_position
    pointer_clip = pointer_clip.with_position(click_position)
    
    return pointer_clip

def create_click_effect(image_clip, click_position, click_duration=0.5, fps=24):
    """
    Create a click effect around the small image at `click_position`.
    """
    click_circle = Image.new("RGBA", (100, 100), (0, 0, 0, 0))
    draw = ImageDraw.Draw(click_circle)
    draw.ellipse([(0, 0), (100, 100)], outline="white", width=3)
    
    click_clip = ImageClip(np.array(click_circle), duration=click_duration).with_fps(fps)
    click_clip = click_clip.with_position(click_position)
    
    return click_clip


def generate_script_recording(script, voice_id, output_path):
    client = ElevenLabs(
        api_key=settings.ELEVENLABS_API_KEY
    )

    script_recording = client.text_to_speech.convert(
        voice_id=voice_id,
        output_format="mp3_44100_128",
        text=script.text,
        model_id="eleven_multilingual_v2"
    )

    audio = BytesIO()
    for chunk in script_recording:
        audio.write(chunk)
    audio.seek(0)

    # Decode mp3 to audio segment
    audio_segment = AudioSegment.from_file(audio, format="mp3")
    
    audio_segment.export(output_path, format="wav")

    return output_path

def assemble_video(audio_path, images, background_image, video_path):
    pointer_image_path = directory + "mouse_pointer.png"  # Path to your mouse pointer image

    # # Load assets
    intro = VideoFileClip(directory + "intro.mp4").resized((1280,720))
    outro = VideoFileClip(directory + "outro.mp4").resized((1280,720))
    voice = AudioFileClip(audio_path)

    # Prepare middle part
    clip_duration = ceil(voice.duration / 5)

    middle_clips  = []

    # Modify this to handle list of lists.
    for i, preview_image  in enumerate(images):
        static_image = create_static_image(background_image, preview_image, images)
        np_image = np.array(static_image)
        image_clip = ImageClip(np_image).with_duration(clip_duration)

        # Get the click position (assume the small image is at a fixed position on the right side)
        click_position = (image_clip.w - 200, 50 + i * 125)

        # Create mouse pointer animation starting from last_position
        mouse_pointer = create_mouse_pointer_animation(click_position=click_position, pointer_image_path=pointer_image_path)
        
        # Create click effect
        click_effect = create_click_effect(image_clip, click_position)

        # Combine the image, pointer, and click effect
        composite_clip = CompositeVideoClip([image_clip, mouse_pointer, click_effect])

        middle_clips.append(composite_clip)

    middle_part = concatenate_videoclips(middle_clips)
    middle_part = middle_part.subclipped(0, voice.duration)
    middle_part = middle_part.with_audio(voice)

    # Combine intro, middle, and outro
    final_video = concatenate_videoclips([intro, middle_part, outro])
    final_video = final_video.resized(height=720)

    frame = final_video.get_frame(0)
    img = Image.fromarray(frame)
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

    # Export final video
    final_video.write_videofile(f'{directory}{video_path}', fps=24)

    video_data = Video(
        name = video_path.split('/')[-1],
        url = video_path,
        duration = final_video.duration,
        size = os.path.getsize(f'{directory}{video_path}'),
        image = img_base64,
    )
    return video_data


@router.post('/videos', response_model=List[Video], status_code=200)
def generate_videos(data: VideosInput):
    scripts_voice_ids = list(product(data.scripts, data.voices))

    result_directory = f'{str(uuid.uuid4())}/'
    audio_directory = f'{result_directory}audio/'
    video_directory = f'{result_directory}video/'
    os.makedirs(f'{directory}{result_directory}')
    os.makedirs(f'{directory}{audio_directory}')
    os.makedirs(f'{directory}{video_directory}')

    scripts_voice_ids_output_paths = [
        (item[0], item[1], f'{directory}{audio_directory}{str(idx+1)}.wav') for idx, item in enumerate(scripts_voice_ids)
    ]

    # script_recordings_output_paths = [f'{directory}voice_recording.mp3']
    script_recordings_output_paths = []

    with Pool(processes=4) as pool:
        futures = [
            pool.apply_async(generate_script_recording, args=script_voice_id_output_path)
            for script_voice_id_output_path in scripts_voice_ids_output_paths
        ]

        for future in futures:
            script_recordings_output_paths.append(future.get())
    
    audio_paths_images_background_image = list(product(script_recordings_output_paths, data.images, [data.background_image]))

    audio_paths_images_background_image_vidoe_paths = [
        (item[0], item[1], item[2], f'{video_directory}{str(idx+1)}.mp4') for idx, item in enumerate(audio_paths_images_background_image) 
    ]

    video_data = []
    with Pool(processes=4) as pool:
        futures = [
            pool.apply_async(assemble_video, args=audio_path_image_background_image_vidoe_path)
            for audio_path_image_background_image_vidoe_path in audio_paths_images_background_image_vidoe_paths
        ]

        for future in futures:
            video_data.append(future.get())

    return video_data
