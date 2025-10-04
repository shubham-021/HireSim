from services.script_service import generate_script

async def define_context_with_prompt(resume: str):
    return await generate_script(resume=resume)
