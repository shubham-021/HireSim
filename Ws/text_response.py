from services.response_service import Interviewer

interviewer: Interviewer | None = None

async def prompt_text_generation(script: str):
    global interviewer
    interviewer = Interviewer(script)
    return await interviewer.start()

async def user_response_to_llm(user_response: str):
    global interviewer
    if interviewer is None:
        raise ValueError("Interview has not been initialized")
    return await interviewer.handle_user_response(user_response)
