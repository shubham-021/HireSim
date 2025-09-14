import { RefObject, Dispatch, SetStateAction } from 'react';
import { createAssemblySocket, getToken } from './assembly';
import { getServerSocket } from './serverSocket';

interface Transcripts {
  [key: string]: string;
}

interface RecordingRefs {
  assemblySocket: RefObject<WebSocket | null>;
  serverSocketPackage: RefObject<any>;
  scriptProcessor: RefObject<ScriptProcessorNode | null>;
  mediaStream: RefObject<MediaStream | null>;
}

export const pcmToAudioBuffer = (pcmData: ArrayBuffer, inputSampleRate: number): AudioBuffer | undefined => {
  const serverSocket = getServerSocket();
  const int16Array = new Int16Array(pcmData);
  const float32Array = new Float32Array(int16Array.length);

  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768;
  }

  const audioBuffer = serverSocket.audioContext.createBuffer(
    1, // mono
    float32Array.length,
    inputSampleRate
  );
  audioBuffer.getChannelData(0).set(float32Array);

  return audioBuffer;
};

export const startRecordingLogic = async (
  transcripts: Transcripts,
  setTranscripts: Dispatch<SetStateAction<Transcripts>>,
  setIsRecording: Dispatch<SetStateAction<boolean>>,
  refs: RecordingRefs,
  onError: () => void
): Promise<void> => {
  const token = await getToken();
  if (!token) return;

  // Get the singleton server socket package
  refs.serverSocketPackage.current = getServerSocket();
  
  refs.assemblySocket.current = createAssemblySocket(
    token, 
    transcripts, 
    setTranscripts, 
    { current: refs.serverSocketPackage.current.socket }, // Wrap in ref-like object
    refs.scriptProcessor, 
    { current: refs.serverSocketPackage.current.audioContext }, // Wrap in ref-like object
    refs.mediaStream
  );

  refs.assemblySocket.current.onerror = (err: Event) => {
    console.error('WebSocket error:', err);
    onError();
  };

  refs.assemblySocket.current.onclose = () => {
    console.log('WebSocket closed');
    refs.assemblySocket.current = null;
  };

  setIsRecording(true);
};

export const stopRecordingLogic = (
  setIsRecording: Dispatch<SetStateAction<boolean>>,
  refs: RecordingRefs
): void => {
  setIsRecording(false);

  if (refs.scriptProcessor.current) {
    refs.scriptProcessor.current.disconnect();
    refs.scriptProcessor.current = null;
  }

  if (refs.mediaStream.current) {
    refs.mediaStream.current.getTracks().forEach(track => track.stop());
    refs.mediaStream.current = null;
  }

  if (refs.assemblySocket.current) {
    refs.assemblySocket.current.send(JSON.stringify({ type: 'Terminate' }));
    refs.assemblySocket.current.close();
    refs.assemblySocket.current = null;
  }

  // Cleanup server socket package
  if (refs.serverSocketPackage.current) {
    refs.serverSocketPackage.current.cleanup();
    refs.serverSocketPackage.current = null;
  }
};

export const calculateOrderedTranscript = (transcripts: Transcripts): string => {
  return Object.keys(transcripts)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => transcripts[k])
    .join(' ');
};
