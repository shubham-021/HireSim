import asyncio
import numpy as np
from openai import AsyncOpenAI
from dotenv import load_dotenv
from openai.helpers import LocalAudioPlayer
import os

load_dotenv()

openai = AsyncOpenAI()


async def generate_audio(res):
    async with openai.audio.speech.with_streaming_response.create(
        model="gpt-4o-mini-tts",
        voice="coral",
        input=res,
        instructions=(
            "Please read the response clearly and naturally, maintaining a professional yet friendly tone "
            "suitable for a job interview. Speak at a moderate pace, articulate each word, and use natural "
            "intonation to convey engagement and interest. Slightly adjust your pitch and pauses to match "
            "the flow of a real interviewer, ensuring the candidate feels comfortable and encouraged to respond."
        ),
        response_format="pcm",
    ) as response:
        # await LocalAudioPlayer().play(response)
        # data = await response
        # print(data)
        # with open("output.txt" , "wb") as f:
        async for chunk in response.iter_bytes():
            # print(chunk)
            # f.write(chunk)
            yield chunk

# if __name__ == "__main__":
#     asyncio.run()
