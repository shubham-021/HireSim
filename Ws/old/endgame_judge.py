from openai import OpenAI
from dotenv import load_dotenv
from typing import Dict,List

load_dotenv()

# {"role" : "assistant" , "content" : first_reply}

def call_end(script:str,messages):
    client = OpenAI()

    SYSTEM_PROMPT = f"""
        Your job is to judge whether the given series of conversation has concluded or not , for better conclusion analyze the script provided
        ,if it has concluded , generate a json schema containing type as inti_review.

        Script: {script}
        Messages: {messages}

        Example:
            Analyze : Message element refering to "role":"assistant" has some content which is providing feedback to user and asking if they have some question,
                      then element after that refering to "role":"user" is asking some question , so its most probable that conversation is heading towards end.
            Analyze : "role":"assistant" content says "Thank you , now your interview is over you can head to review section for the results." , this means the 
                      the conversation is ended , now i should output the json schema.
            Output: {{"type": "init_review"}}
    """