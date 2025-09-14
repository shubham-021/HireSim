from openai import AsyncOpenAI
from dotenv import load_dotenv
from text_response import prompt_text_generation
import os

load_dotenv()

client = AsyncOpenAI() 

async def define_context_with_prompt(resume , role="fullstack web developer"):
    PROMPT= f"""
        You are an interviewer taking a professional interview of a candidate based on the role applied and the resume submitted by them.
        You have to generate the whole flow of the interview from the interviewer perspective.

        Rules to be followed:
         1. Interview should fully align to the role applied and the submitted resume
         2. You can generate only 6 questions overall.
         3. Follow the full structure of how a real interview take place
         4. Take all the necessary details from the given resume

        Resume : {resume}
        Role: {role}

        Example:
        Taking an interview for the role of fullstack
        Candidate resume shows that he knows nextjs , reactjs , javascript , nodejs , mongodb , postgresql , prisma orm , drizzle orm , cpp , basic dsa

        Output:
        Step 1. Greeting & Setting the Tone
            "Hey [Name], nice to meet you! Thanks for joining today. How's your day been so far?"
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
    message = [{
        "role" : "system" , "content" : PROMPT
    }]

    return await go_through(message)


async def go_through(message):

    res = await client.chat.completions.create(
          model="gpt-4o",
          messages=message
     )
    return res.choices[0].message.content
    # prompt_text_generation(script=script)s