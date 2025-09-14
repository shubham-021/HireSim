import { RefObject, Dispatch, SetStateAction } from 'react';
import { createMicrophoneControl, setGlobalMicControl, getGlobalMicControl } from './microphoneControl';
import { setupAudioInput } from './audioLogic';
import { sendToServerSocket } from './serverSocket';

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

export const createAssemblySocket = (
  token: string,
  transcripts: Transcripts,
  setTranscripts: Dispatch<SetStateAction<Transcripts>>,
  audioContext: AudioContext,
  mediaStream: RefObject<MediaStream | null>,
  scriptProcessor: RefObject<ScriptProcessorNode | null>,
  onError: () => void
): WebSocket => {
  const wsUrl = `wss://streaming.assemblyai.com/v3/ws?sample_rate=48000&formatted_finals=true&token=${token}&end_of_turn_confidence_threshold=0.8&min_end_of_turn_silence_when_confident=3400&max_turn_silence=3400`;
  const assemblySocket = new WebSocket(wsUrl);
  
  const turns: Transcripts = {};

  // All assembly socket events defined here
  assemblySocket.onopen = async () => {
    console.log('WebSocket connection established');
    
    await setupAudioInput(
      audioContext,
      assemblySocket,
      mediaStream,
      scriptProcessor
    );
  };

  assemblySocket.onmessage = (event: MessageEvent) => {
    const message: TranscriptMessage = JSON.parse(event.data);

    if (message.type === 'Turn') {
      console.log(message);
      const { turn_order, transcript, turn_is_formatted, end_of_turn } = message;
      turns[turn_order] = transcript;

      if (turn_is_formatted && end_of_turn) {
        // Send transcript to server using utility function
        sendToServerSocket(JSON.stringify({
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

      setTranscripts({ ...turns });
    }
  };

  assemblySocket.onerror = (err: Event) => {
    console.error('WebSocket error:', err);
    onError();
  };

  assemblySocket.onclose = () => {
    console.log('WebSocket closed');
  };

  return assemblySocket;
};
