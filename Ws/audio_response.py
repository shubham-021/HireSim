from services.llm_client import client

async def generate_audio(text: str):
    async with client.audio.speech.with_streaming_response.create(
        model="gpt-4o-mini-tts",
        voice="coral",
        input=text,
        instructions=(
            "Read the response clearly and naturally in a professional yet friendly tone. "
            "Speak at a moderate pace with natural intonation, adjusting pitch and pauses "
            "to match a real interviewer, keeping the candidate comfortable."
        ),
        response_format="pcm",
    ) as response:
        async for chunk in response.iter_bytes():
            yield chunk
