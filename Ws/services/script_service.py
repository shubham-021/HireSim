from services.llm_client import chat_completion

async def generate_script(resume: str, role: str = "fullstack web developer"):
    prompt = f"""
    You are an interviewer preparing a professional interview script.
    Rules:
    1. Tailor the script to the given role and resume.
    2. Create exactly 6 main questions.
    3. Structure it like a real interview with greeting, warm-up, technical, and wrap-up.
    4. Use resume details for realism.

    Resume: {resume}
    Role: {role}
    """
    messages = [{"role": "system", "content": prompt}]
    return await chat_completion("gpt-4o", messages)
