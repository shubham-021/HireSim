'use client';

import { useCallback, useRef, useState } from 'react';

export default function Home() {
  const assemblySocket = useRef<WebSocket | null >(null);
  const serverSocket = useRef<WebSocket | null >(null);
  const audioContext = useRef<AudioContext | null >(null);
  const mediaStream = useRef<MediaStream | null >(null);
  const scriptProcessor = useRef<ScriptProcessorNode | null >(null);

  const [isRecording, setIsRecording] = useState(false);
  const [transcripts, setTranscripts] = useState<any>({}); 


  const pcmToAudioBuffer = useCallback((pcmData : any , inputSampleRate : any) => {
    const int16Array = new Int16Array(pcmData);
    const float32Array = new Float32Array(int16Array.length);

    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768;
    }

    const audioBuffer = audioContext.current?.createBuffer(
      1, // mono
      float32Array.length,
      inputSampleRate
    );
    audioBuffer?.getChannelData(0).set(float32Array);

    return audioBuffer;
  },[])

  const getToken = async () => {
    const response = await fetch('/api/token');
    const data = await response.json();

    if (!data || !data.token) {
      alert('Failed to get token');
      return null;
    }

    return data.token;
  };

  const startRecording = async () => {
    const token = await getToken();
    if (!token) return;

    const wsUrl = `wss://streaming.assemblyai.com/v3/ws?sample_rate=48000&formatted_finals=true&token=${token}&end_of_turn_confidence_threshold=0.8&min_end_of_turn_silence_when_confident=3400&max_turn_silence=3400`;
    assemblySocket.current = new WebSocket(wsUrl);
    serverSocket.current = new WebSocket("ws://localhost:8080/response/audio");
    serverSocket.current.binaryType = "arraybuffer";
    
    let playhead = audioContext.current?.currentTime;
    const BUFFER_DELAY = 0.2;
    let leftover = new Uint8Array(0);

    serverSocket.current.onmessage = (event) => {
      // console.log("Here -->" , event.data instanceof ArrayBuffer)
      // console.log("Here -->" , typeof(event.data))

      if(event.data instanceof ArrayBuffer){
        let newChunk = new Uint8Array(event.data);
        if(leftover.length > 0) {
          let combined = new Uint8Array(leftover.length + newChunk.length);
          combined.set(leftover, 0);
          combined.set(newChunk, leftover.length);
          newChunk = combined;
          leftover = new Uint8Array(0);
        }

        if (newChunk.length % 2 !== 0) {
          leftover = newChunk.slice(-1);  // last byte
          newChunk = newChunk.slice(0, -1); // aligned data
        }

        if(newChunk.length === 0) return

        const pcmData = new Int16Array(newChunk.buffer);

        const float32Array = new Float32Array(pcmData.length);
        for (let i = 0; i < pcmData.length; i++) {
          float32Array[i] = pcmData[i] / 32768;
        }

        const sampleRate = 24000;
        const audioBuffer = audioContext.current?.createBuffer(1, float32Array.length, sampleRate);
        audioBuffer?.getChannelData(0).set(float32Array);

        if(audioContext.current && audioBuffer){
          const currentTime = audioContext.current.currentTime
          if (!playhead || playhead < currentTime + BUFFER_DELAY){
            playhead = currentTime + BUFFER_DELAY;
          }

          const source = audioContext.current.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContext.current.destination);
          source.start(playhead);
          playhead += audioBuffer.duration;

          console.log(`Scheduled audio at ${playhead}, duration: ${audioBuffer.duration}`);
        }
      }
    }
    

    const turns : any = {}; // for storing transcript updates per turn

    assemblySocket.current.onopen = async () => {
      console.log('WebSocket connection established');
      setIsRecording(true);

      mediaStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      const track = mediaStream.current.getAudioTracks()[0];
      audioContext.current = new AudioContext();
      console.log('Detected sample rate:', audioContext.current.sampleRate);

      const source = audioContext.current.createMediaStreamSource(mediaStream.current);
      scriptProcessor.current = audioContext.current.createScriptProcessor(4096, 1, 1);

      source.connect(scriptProcessor.current);
      scriptProcessor.current.connect(audioContext.current.destination);

      scriptProcessor.current.onaudioprocess = (event) => {
        if (!assemblySocket.current || assemblySocket.current.readyState !== WebSocket.OPEN) return;

        const input = event.inputBuffer.getChannelData(0);
        const buffer = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
          buffer[i] = Math.max(-1, Math.min(1, input[i])) * 0x7fff;
        }
        assemblySocket.current.send(buffer.buffer);
      };
    };

    assemblySocket.current.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'Turn') {
        console.log(message)
        const { turn_order, transcript, turn_is_formatted , end_of_turn } = message;
        turns[turn_order] = transcript;

        if(turn_is_formatted && end_of_turn){
          serverSocket.current?.send(JSON.stringify({type:"transcript" , "transcript" : transcript}))
        }

        const ordered = Object.keys(turns)
          .sort((a, b) => Number(a) - Number(b))
          .map((k) => turns[k])
          .join(' ');

        setTranscripts({ ...turns });
      }
    };

    assemblySocket.current.onerror = (err) => {
      console.error('WebSocket error:', err);
      stopRecording();
    };

    assemblySocket.current.onclose = () => {
      console.log('WebSocket closed');
      assemblySocket.current = null;
    };
  };

  const stopRecording = () => {
    setIsRecording(false);

    if (scriptProcessor.current) {
      scriptProcessor.current.disconnect();
      scriptProcessor.current = null;
    }

    if (audioContext.current) {
      audioContext.current.close();
      audioContext.current = null;
    }

    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach(track => track.stop());
      mediaStream.current = null;
    }

    if (assemblySocket.current) {
      assemblySocket.current.send(JSON.stringify({ type: 'Terminate' }));
      assemblySocket.current.close();
      assemblySocket.current = null;
    }

    if(serverSocket.current){
      serverSocket.current.send(JSON.stringify({ type: 'Terminate' }));
      serverSocket.current.close();
      serverSocket.current = null;
    }
  };

  const orderedTranscript = Object.keys(transcripts)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => transcripts[k])
    .join(' ');

  return (
    <div className="App w-screen h-screen">
      <header>
        <h1 className="header__title">Real-Time Transcription (v3)</h1>
        <p className="header__sub-title">
          Powered by AssemblyAI's latest real-time model
        </p>
      </header>
      <div className="real-time-interface">
        <p className="real-time-interface__title">Click start to begin recording!</p>
        {isRecording ? (
          <button className="real-time-interface__button" onClick={stopRecording}>
            Stop recording
          </button>
        ) : (
          <button className="real-time-interface__button" onClick={startRecording}>
            Record
          </button>
        )}
      </div>
      <div className="real-time-interface__message">
        <p><strong>Transcript:</strong> {orderedTranscript}</p>
      </div>
    </div>
  );
}

