from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()
client = AsyncOpenAI()

async def chat_completion(model: str, messages: list, response_format=None):
    params = {"model": model, "messages": messages}
    if response_format:
        params["response_format"] = response_format
    res = await client.chat.completions.create(**params)
    return res.choices[0].message.content
