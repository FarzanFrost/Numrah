from moviepy import (
    VideoFileClip,
    AudioFileClip,
    ImageClip,
    concatenate_videoclips,
    CompositeVideoClip,
    ImageSequenceClip,
    vfx,
    TextClip,
)
from fastapi import APIRouter
import os
import numpy as np
from math import ceil
from PIL import Image, ImageDraw, ImageFilter, ImageFont
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

def add_rounded_border(image, border_size=7, border_color=(255, 255, 255), corner_radius=14):
    # Step 1: Create a new image with a larger size for the border
    bordered_width = image.width + 2 * border_size
    bordered_height = image.height + 2 * border_size

    # Create the final image with transparent background
    with Image.new("RGBA", (bordered_width, bordered_height), (0, 0, 0, 0)) as final_image:
        # Step 2: Create a mask for the rounded corners of the border
        with Image.new("L", (bordered_width, bordered_height), 0) as border_mask:
            draw_border = ImageDraw.Draw(border_mask)
            draw_border.rounded_rectangle(
                [(0, 0), (bordered_width, bordered_height)],
                corner_radius, fill=255)

            # Step 3: Create the border and apply rounded corners to it
            with Image.new("RGBA", (bordered_width, bordered_height), border_color) as border:
                # Step 4: Apply the rounded border to the final image
                final_image.paste(border, (0, 0), border_mask)  # Apply border with rounded corners

        # Step 5: Create a mask for the rounded corners of the image
        with Image.new("L", (image.width, image.height), 0) as image_mask:
            draw_image = ImageDraw.Draw(image_mask)
            draw_image.rounded_rectangle(
                [(0, 0), (image.width, image.height)],
                corner_radius, fill=255)

            # Step 6: Paste the original image into the center of the final image
            final_image.paste(image, (border_size, border_size), image_mask)

        # Return the final image (ensure it stays open in the calling context)
        return final_image.copy()  # Use `.copy()` to detach it from the `with` context


def add_border_to_video_frames(clip, border_size=7, border_color=(255, 255, 255), corner_radius=14):
    def add_border_to_frame(frame):
        # Convert the frame (NumPy array) to a PIL Image
        image = Image.fromarray(frame)
        # Apply the rounded border
        bordered_image = add_rounded_border(image, border_size, border_color, corner_radius)
        # Convert the modified PIL Image back to a NumPy array
        return np.array(bordered_image)
    
    # Process each frame of the video
    frames_with_border = [add_border_to_frame(frame) for frame in clip.iter_frames()]
    
    # Create a new video clip from the processed frames
    return ImageSequenceClip(frames_with_border, fps=clip.fps)


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

    return output_path, script.text


def decode_base64_image(base64_str):
    """Decodes a base64 string into a Pillow image."""
    image_data = base64.b64decode(base64_str)
    return Image.open(BytesIO(image_data)).convert("RGBA")


def add_text_label(image: Image, text: str, font_path: str) -> Image:
    # Create a drawing context for the image
    draw = ImageDraw.Draw(image)
    
    # Load the font
    font = ImageFont.truetype(font_path, size=80)  # Adjust the font size as needed

    # Split the text into words and join with '\n' to create multi-line text
    multi_line_text = '\n'.join(text.split())

    # Calculate the bounding box of the text (for multi-line text)
    bbox = draw.textbbox((0, 0), multi_line_text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # Set the position for the text (top-left corner)
    position = (20, 20)  # Top-left corner

    # Add the multi-line text to the image
    draw.text(position, multi_line_text, font=font, fill="black", )

    return image


def get_word_timings(script, audio_duration):
    words = script.split()
    num_words = len(words)
    avg_time_per_word = audio_duration / num_words  # Approximate time per word

    timings = []
    current_time = 0.0
    for word in words:
        start_time = current_time
        end_time = start_time + avg_time_per_word
        timings.append({"word": word, "start": start_time, "end": end_time})
        current_time = end_time

    return timings


def assemble_video(audio_path_script, images, background_image, video_path):
    final_video_dimensions = (1280,720)
    preview_video_dimensions = (480,480)
    icon_clip_dimensions = (100,150)
    mouse_dimensions = (20,20)
    preview_video_position = (400,20)
    no_of_preview_images = 6
    pause_duration = 0.5  # Pause duration in seconds at each position
    transition_speedup = 0.5  # Factor to speed up transitions (e.g., 0.5 means half the time)
    pointer_image_path = directory + "mouse_pointer.png"  # Path to your mouse pointer image
    font_path = f'{directory}ARIALBD.TTF'

    # audio_path, script = (f'{directory}voice_recording.mp3', "HI how are you, what do you want? I'm making an app.")
    audio_path, script = audio_path_script

    background = decode_base64_image(background_image)
    image1 = decode_base64_image(images[0][0])
    image2 = decode_base64_image(images[1][0])
    image3 = decode_base64_image(images[2][0])
    image4 = decode_base64_image(images[3][0])
    image5 = decode_base64_image(images[4][0])

    with (
        VideoFileClip(directory + "intro.mp4") as intro,
        VideoFileClip(directory + "outro.mp4") as outro,
        VideoFileClip(directory + "effect.webm") as effect,
        Image.open(pointer_image_path) as mouse,
        AudioFileClip(audio_path) as voice,
    ):
        intro = intro.resized(final_video_dimensions)
        outro = outro.resized(final_video_dimensions)
        clip_duration = ceil(voice.duration / no_of_preview_images)
        effect = effect.subclipped(2.5,3.5)
        effect = effect.with_speed_scaled(2)
        effect = add_border_to_video_frames(effect)

        mouse = mouse.resize(mouse_dimensions)

        bordered_images = [
            add_rounded_border(background), 
            add_rounded_border(image1),
            add_rounded_border(image2),
            add_rounded_border(image3),
            add_rounded_border(image4),
            add_rounded_border(image5),
        ]

        preview_clip_images = []
        mouse_start_times = []

        for idx, bordered_image in enumerate(bordered_images):
            start_time = idx * clip_duration
            preview_clip_image = ImageClip(
                np.array(bordered_image)
            ).with_duration(
                clip_duration
            ).resized(
                preview_video_dimensions
            ).with_start(start_time)
            if idx > 0:
                preview_clip_image = preview_clip_image.with_effects([vfx.FadeIn(1)])
                mouse_start_times.append(start_time)
            preview_clip_images.append(preview_clip_image)

        middle_clip = CompositeVideoClip(preview_clip_images)
        middle_duration = middle_clip.duration

        background_clip = ImageClip(
            np.array(
                add_rounded_border(background).filter(ImageFilter.GaussianBlur(10))
            )
        ).with_duration(middle_duration).resized(final_video_dimensions)

        icon_clips = []
        mouse_coordinates = []

        for idx, bordered_image in enumerate(bordered_images[1:]):
            coordinates = (290 + idx * 150,550)
            icon_clip = ImageClip(
                np.array(add_text_label(image=bordered_image, text=images[idx][1], font_path=font_path))
            ).with_duration(
                middle_duration
            ).resized(
                icon_clip_dimensions
            ).with_position(
                coordinates
            )

            icon_clips.append(icon_clip)
            mouse_coordinates.append(coordinates)

        mouse_coordinates = [
            (x + 40, y + 50) for x, y in mouse_coordinates
        ]


        def move_position(t):
            adjusted_times = []
            for i in range(len(mouse_start_times) - 1):
                start = mouse_start_times[i]
                end = mouse_start_times[i + 1]
                transition_duration = (end - start - pause_duration) * transition_speedup
                adjusted_times.append((start, start + pause_duration, start + pause_duration + transition_duration))
            adjusted_times.append((mouse_start_times[-1], mouse_start_times[-1], mouse_start_times[-1]))  # Last position stays

            for i, (start, pause_end, move_end) in enumerate(adjusted_times):
                if t < pause_end:
                    return mouse_coordinates[i]  # Stay at the current position during pause
                if pause_end <= t < move_end:
                    # Interpolate between positions[i] and positions[i+1]
                    time_fraction = (t - pause_end) / (move_end - pause_end)
                    x = mouse_coordinates[i][0] + (mouse_coordinates[i + 1][0] - mouse_coordinates[i][0]) * time_fraction
                    y = mouse_coordinates[i][1] + (mouse_coordinates[i + 1][1] - mouse_coordinates[i][1]) * time_fraction
                    return (x, y)
            return mouse_coordinates[-1]  # Stay at the last position

        mouse_clip = ImageClip(
            np.array(mouse)
        ).with_duration(middle_duration).with_position(move_position)


        effects = []

        for start_time in mouse_start_times:
            effects.append(
                effect.copy().resized(preview_video_dimensions).with_start(start_time).with_effects([vfx.FadeIn(0.25),vfx.FadeOut(0.25)])
            )
        
        middle_clip = CompositeVideoClip([middle_clip] + effects)

        middle_clip = middle_clip.subclipped(0, voice.duration)
        middle_clip = middle_clip.with_audio(voice)

        #  Get the word timings
        word_timings = get_word_timings(script, voice.duration)

        # Create text clips for each word
        text_clips = []
        for timing in word_timings:
            text = TextClip(font=font_path, text=timing["word"], font_size=20, color='black')
            text = text.with_position(tuple(map(sum, zip(preview_video_position, (250, 500))))).with_start(timing["start"]).with_end(timing["end"])
            text_clips.append(text)

        middle_clip = CompositeVideoClip([background_clip, middle_clip.with_position(preview_video_position), *text_clips, *icon_clips, mouse_clip])

        middle_clip = middle_clip.resized(final_video_dimensions)

        final_video = concatenate_videoclips([intro, middle_clip, outro]).resized(height=720)

        # final_video.preview()
        final_video.write_videofile(f'{directory}{video_path}', fps=24)

        frame = final_video.get_frame(0)
        img = Image.fromarray(frame)
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
        
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

    script_and_recording_output_paths = []

    with Pool(processes=4) as pool:
        futures = [
            pool.apply_async(generate_script_recording, args=script_voice_id_output_path)
            for script_voice_id_output_path in scripts_voice_ids_output_paths
        ]

        for future in futures:
            script_and_recording_output_paths.append(future.get())

    script_and_recording_output_paths

    script_audio_paths_images_background_image = list(product(script_and_recording_output_paths, data.images, [data.background_image]))

    audio_paths_images_background_image_vidoe_paths = [
        (item[0], item[1], item[2], f'{video_directory}{str(idx+1)}.mp4') for idx, item in enumerate(script_audio_paths_images_background_image) 
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