from services.llm_client import chat_completion
import json

async def judge_conversation(script: str, messages: list, qa_history: list):
    system_prompt = f"""
    You are a judge monitoring an interview.
    Decide if the interview has ended based on the script and conversation.
    If ended, output JSON:
    {{
      "type": "init_review",
      "score": <int 1-10>,
      "remarks": "<short feedback>",
      "review": "<detailed review>",
      "qa_history": <list of question/answer objects>
    }}
    Otherwise, output:
    {{
      "type": "continue"
    }}
    """
    judge_messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Script: {script}\nMessages: {messages}\nQA: {qa_history}"}
    ]

    response_format = {
        "type": "json_schema",
        "json_schema": {
            "name": "judge_output",
            "schema": {
                "type": "object",
                "properties": {
                    "type": {"type": "string"},
                    "score": {"type": "integer"},
                    "remarks": {"type": "string"},
                    "review": {"type": "string"},
                    "qa_history": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "question": {"type": "string"},
                                "answer": {"type": "string"}
                            },
                            "required": ["question", "answer"]
                        }
                    }
                },
                "required": ["type"]
            }
        }
    }

    result = await chat_completion("gpt-4o-mini", judge_messages, response_format)
    return json.loads(result)
