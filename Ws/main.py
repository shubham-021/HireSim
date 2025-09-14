from fastapi import FastAPI , WebSocket , WebSocketDisconnect
import json
# from text_response import generate_response
from audio_response import generate_audio
import base64
from resume import define_context_with_prompt
from text_response import prompt_text_generation , user_response_to_llm

app=FastAPI()

@app.websocket("/response/audio")
async def speech(websocket : WebSocket):
    await websocket.accept()
    print("WebSocket connection established")
    script = None

    try:
        while True:
            message = await websocket.receive()
            # print(f"Message received: {message}")

            if "text" in message:
                data = json.loads(message.get("text"))

                if(data.get("type") == "Terminate"):
                    await websocket.close()
                    break

                if(data.get("type") == "init"):
                    # print(data.get("resume"))
                    resume = data.get("resume")
                    try:
                        script = await define_context_with_prompt(resume=resume)
                        # print(script)
                    except Exception as e:
                        print(f"Error while generating script: {e}")
                    await websocket.send_text(json.dumps({"type":"load_page"}))
                
                if(data.get("type") == "start"):
                    if(script == None):
                        print("Script is set null")
                        return
                    try:
                        res = await prompt_text_generation(script=script)
                        try:
                            async for chunk in generate_audio(res):
                                await websocket.send_bytes(chunk)
                        except Exception as e:
                            print(f"Error generating audio of type start: {e}")
                        finally:
                            await websocket.send_text(json.dumps({"type":"audio_end", "audio":"ended"}))
                    except Exception as e:
                        print(f"Some error while generating response after scripting: {e}")

                if(data.get("type") == "transcript"):
                    print(f"User: {data.get("transcript")} \n")
                    try:
                        res = await user_response_to_llm(data.get("transcript"))
                        print(f"LLM: {res}")
                        try:
                            async for chunk in generate_audio(res):
                                await websocket.send_bytes(chunk)
                        except Exception as e:
                            print(f"Error generating audio: {e}")
                        finally:
                            await websocket.send_text(json.dumps({"type":"audio_end", "audio":"ended"}))
                    except Exception as e:
                        print(f"Some error occured while passing user response and generating llm's response : {e}")
    except WebSocketDisconnect:
        print("Connection closed")
    except Exception as e:
        print(f"Some error occurred: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app , host="0.0.0.0", port=8080)


