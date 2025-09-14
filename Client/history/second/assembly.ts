import { RefObject, Dispatch, SetStateAction } from 'react';
import { createMicrophoneControl, setGlobalMicControl, getGlobalMicControl } from './microphone';

interface TranscriptMessage {
  type: string;
  turn_order: number;
  transcript: string;
  turn_is_formatted: boolean;
  end_of_turn: boolean;
}

interface Transcripts {
  [key: string]: string;
}

export const createAssemblySocket = (
  token: string,
  transcripts: Transcripts,
  setTranscripts: Dispatch<SetStateAction<Transcripts>>,
  serverSocket: RefObject<WebSocket | null>,
  scriptProcessor: RefObject<ScriptProcessorNode | null>,
  audioContext: RefObject<AudioContext | null>,
  mediaStream: RefObject<MediaStream | null>
): WebSocket => {
  const wsUrl = `wss://streaming.assemblyai.com/v3/ws?sample_rate=48000&formatted_finals=true&token=${token}&end_of_turn_confidence_threshold=0.8&min_end_of_turn_silence_when_confident=3400&max_turn_silence=3400`;
  const assemblySocket = new WebSocket(wsUrl);
  
  const turns: Transcripts = {}; // for storing transcript updates per turn

  assemblySocket.onopen = async () => {
    console.log('WebSocket connection established');

    mediaStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Create microphone control and set it globally
    const micControl = createMicrophoneControl(mediaStream.current);
    setGlobalMicControl(micControl);

    const track = mediaStream.current.getAudioTracks()[0];
    audioContext.current = new AudioContext();
    console.log('Detected sample rate:', audioContext.current.sampleRate);

    const source = audioContext.current.createMediaStreamSource(mediaStream.current);
    scriptProcessor.current = audioContext.current.createScriptProcessor(4096, 1, 1);

    source.connect(scriptProcessor.current);
    scriptProcessor.current.connect(audioContext.current.destination);

    scriptProcessor.current.onaudioprocess = (event: AudioProcessingEvent) => {
      if (!assemblySocket || assemblySocket.readyState !== WebSocket.OPEN) return;

      const input = event.inputBuffer.getChannelData(0);
      const buffer = new Int16Array(input.length);
      for (let i = 0; i < input.length; i++) {
        buffer[i] = Math.max(-1, Math.min(1, input[i])) * 0x7fff;
      }
      assemblySocket.send(buffer.buffer);
    };
  };

  assemblySocket.onmessage = (event: MessageEvent) => {
    const message: TranscriptMessage = JSON.parse(event.data);

    if (message.type === 'Turn') {
      console.log(message);
      const { turn_order, transcript, turn_is_formatted, end_of_turn } = message;
      turns[turn_order] = transcript;

      if (turn_is_formatted && end_of_turn) {
        // Send transcript to server
        serverSocket.current?.send(JSON.stringify({
          type: "transcript", 
          transcript: transcript
        }));
        
        // Mute microphone after sending transcript
        const micControl = getGlobalMicControl();
        if (micControl) {
          micControl.mute();
          console.log('Microphone muted - waiting for audio playback to complete');
        }
      }

      const ordered = Object.keys(turns)
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => turns[k])
        .join(' ');

      setTranscripts({ ...turns });
    }
  };

  assemblySocket.onerror = (err: Event) => {
    console.error('WebSocket error:', err);
  };

  assemblySocket.onclose = () => {
    console.log('WebSocket closed');
  };

  return assemblySocket;
};

interface TokenResponse {
  token?: string;
}

export const getToken = async (): Promise<string | null> => {
  const response = await fetch('/api/token');
  const data: TokenResponse = await response.json();

  if (!data || !data.token) {
    alert('Failed to get token');
    return null;
  }

  return data.token;
};
