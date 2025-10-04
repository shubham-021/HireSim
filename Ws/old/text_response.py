from openai import AsyncOpenAI
from dotenv import load_dotenv
import os
from Ws.old.endgame_judge import call_end

load_dotenv()

client = AsyncOpenAI()
messages = []
global_script = ""

async def prompt_text_generation(script):
    global messages
    global global_script
    global_script = script
    SYSTEM_PROMPT = f"""
        You are an interview taking agent , whose role is to take interview of a candidate based on the script provided.
        Dont read the script as it is , generate responses question by question , wait for the user's response.Follow the example given.

        Script: {script} 

        Rules to be followed:
        1.Behave like an interviewer , be friendly , can also provide some help if user is stuck somewhere.
        2.Steps given in the script is the flow of how the interview should proceed.
        3.Do not have to follow the script as it is , it's just a map to be followed , be flexible enough so that you can provide a real time experience.
        4.Do not generate the script again in the response , just follow it to structure the conversation between you, the interviewer and candidate , the interviewee
        3.follow the script sequentially, one turn at a time.
        4.Stop your output when you reach the first point that naturally requires the user's response.
        5.A “point requiring the user's response” is defined as:
            The end of a question directed to the user.
            Or any scripted moment explicitly marked as waiting for input.
            Do not read beyond that point until the user responds.
            Preserve all non-question lines that occur before that point in your output. 

        Example :
        Provided Script :
            Step 1. Greeting & Setting the Tone
                "Hey Shubham, nice to meet you! Thanks for joining today. How's your day been so far?"
                Brief small talk so they feel comfortable.
                Outline what will happen:
                    "So today's interview will be a mix of technical and design questions, plus a little bit of problem-solving. It's not just about getting the right answer — I want to see how you think. If you're stuck, talk me through your thought process — we can work through it together. Sound good?"
            Step 2. Warm-up
                Goal: Break the ice technically, get them talking about something they know.
                Q1: "Before we dive in, could you give me a quick overview of a project you've worked on that used both frontend and backend? What was the stack, and what part did you enjoy the most?"
            Step 3. Frontend Core
                Goal: Test practical React + Next.js understanding.
                Q2: "In Next.js, what's the difference between client-side rendering, server-side rendering, and static site generation? Can you share when you'd use each?"
                Q3: "In React, what is hydration, and what kind of bugs might occur if it fails?"
            Step 4. Backend & Database
                Goal: See their database design, ORM skills, and API thinking.
                Q4: "Let's say we're building a blogging platform with users, posts, and comments. How would you design the PostgreSQL schema for this using Prisma, including relationships?"
            Step 5. ORM & Performance
                Q5: "When using Prisma or Drizzle ORM, what is the N+1 query problem, and how would you handle it?"
            Step 6. System Design Lite
                Goal: Check architecture skills in limited time.
                Q6: "If you had to build a real-time chat feature in a Next.js + Node.js app, how would you approach it? What technologies would you use and why?"
            Step 7. Wrap-Up
                Ask if they have any questions for you.
                Give positive reinforcement:
                    Tell him how he performed , reviewing his all responses ,if responses were off tell him how can he improve , if everything's good , assure him with that
                    End on a warm note:
                    "Whether or not this role works out, I think you've got a lot of potential with your fullstack skills. Keep building cool stuff!"
        """
    messages = [{"role": "system" , "content":SYSTEM_PROMPT}]
    return await llm_start()
    # while True:
    #     user_input = input("You: ")
    #     llm_message = user_response_to_llm(user_input , messages)
    #     print("LLM:", llm_message)


async def llm_start():
    """Start conversation with LLM's first message."""
    global messages
    res = await client.chat.completions.create(
        model="gpt-4",
        messages=messages
    )
    first_reply = res.choices[0].message.content

    messages.append(
        {"role" : "assistant" , "content" : first_reply}
    )

    # print(first_reply)
    return first_reply

async def user_response_to_llm(response):
    """Send user's reply to LLM and get the next question/response."""
    global messages
    messages.append(
        {"role":"user" , "content" : response}
    )

    res = await client.chat.completions.create(
        model="gpt-4",
        messages=messages
    )

    llm_reply = res.choices[0].message.content

    messages.append({"role" : "assistant" , "content" : llm_reply})
    call_end(script=global_script,messages=messages)
    return llm_reply

# def generate_audio(res):
#     pass

