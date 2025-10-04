from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import json
from audio_response import generate_audio
from resume import define_context_with_prompt
from text_response import prompt_text_generation, user_response_to_llm
from services.response_service import Interviewer  # new

app = FastAPI()


@app.websocket("/response/audio")
async def speech(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket connection established")
    script = None
    interviewer = None

    try:
        while True:
            message = await websocket.receive()

            if "text" in message:
                data = json.loads(message.get("text"))

                if data.get("type") == "Terminate":
                    await websocket.close()
                    break

                if data.get("type") == "init":
                    resume = data.get("resume")
                    try:
                        script = await define_context_with_prompt(resume=resume)
                        interviewer = Interviewer(script=script)
                    except Exception as e:
                        print(f"Error while generating script: {e}")
                    await websocket.send_text(json.dumps({"type": "load_page"}))

                if data.get("type") == "start":
                    if script is None or interviewer is None:
                        print("Script or interviewer is not initialized")
                        return
                    try:
                        res = await prompt_text_generation(script=script)
                        # save Q in history
                        interviewer.qa_history.append({"question": res, "answer": None})
                        try:
                            async for chunk in generate_audio(res):
                                await websocket.send_bytes(chunk)
                        except Exception as e:
                            print(f"Error generating audio of type start: {e}")
                        finally:
                            await websocket.send_text(
                                json.dumps({"type": "audio_end", "audio": "ended"})
                            )
                    except Exception as e:
                        print(
                            f"Some error while generating response after scripting: {e}"
                        )

                if data.get("type") == "transcript":
                    user_text = data.get("transcript")
                    print(f"User: {user_text}\n")
                    try:
                        # Get interviewer + judge response
                        reply, judge_result = await interviewer.handle_user_response(
                            user_text
                        )

                        # update last QA entry with user's answer + assistant reply
                        if interviewer.qa_history and interviewer.qa_history[-1][
                            "answer"
                        ] is None:
                            interviewer.qa_history[-1]["answer"] = user_text
                        interviewer.qa_history.append(
                            {"question": reply, "answer": None}
                        )

                        if judge_result["type"] == "continue":
                            print(f"LLM: {reply}")
                            try:
                                async for chunk in generate_audio(reply):
                                    await websocket.send_bytes(chunk)
                            except Exception as e:
                                print(f"Error generating audio: {e}")
                            finally:
                                await websocket.send_text(
                                    json.dumps({"type": "audio_end", "audio": "ended"})
                                )

                        elif judge_result["type"] == "init_review":
                            # attach qa_history to judge result
                            judge_result["qa_history"] = interviewer.qa_history
                            await websocket.send_text(json.dumps({"type": "interview_end"}))
                            await websocket.send_text(json.dumps({"type": "review", "data": judge_result}))
                            await websocket.close()
                            break

                    except Exception as e:
                        print(
                            f"Error while passing user response and generating llm's response: {e}"
                        )

    except WebSocketDisconnect:
        print("Connection closed")
    except Exception as e:
        print(f"Some error occurred: {e}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8080)
