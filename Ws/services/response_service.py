from services.llm_client import chat_completion
from services.judge_service import judge_conversation

class Interviewer:
    def __init__(self, script: str):
        self.script = script
        self.messages = []
        self.qa_history = [] 

    async def start(self):
        system_prompt = f"""
        You are an interviewer running a live interview.
        Use the script as a guide, but stay conversational and natural.
        Ask questions one at a time, then wait for the candidate.
        Script: {self.script}
        """
        self.messages = [{"role": "system", "content": system_prompt}]
        reply = await chat_completion("gpt-4o", self.messages)
        self.messages.append({"role": "assistant", "content": reply})
        return reply

    async def handle_user_response(self, user_response: str):
        self.messages.append({"role": "user", "content": user_response})
        reply = await chat_completion("gpt-4o", self.messages)
        self.messages.append({"role": "assistant", "content": reply})

        self.qa_history.append({
            "question": self.messages[-2]["content"],
            "answer": self.messages[-1]["content"]
        })

        judge_result = await judge_conversation(self.script, self.messages, self.qa_history)
        return reply, judge_result
