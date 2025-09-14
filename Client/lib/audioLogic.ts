import { RefObject } from 'react';
import { createMicrophoneControl, setGlobalMicControl, getGlobalMicControl } from './microphoneControl';

interface AudioState {
  playhead: number | undefined;
  isFirstChunk: boolean;
  audioQueue: AudioBuffer[];
  isPlaying: boolean;
  leftover: Uint8Array;
}

interface AudioConfig {
  INITIAL_BUFFER_DELAY: number;
  ONGOING_BUFFER_DELAY: number;
  PRE_BUFFER_COUNT: number;
}

// Audio processing state
const audioState: AudioState = {
  playhead: undefined,
  isFirstChunk: true,
  audioQueue: [],
  isPlaying: false,
  leftover: new Uint8Array(0)
};

const audioConfig: AudioConfig = {
  INITIAL_BUFFER_DELAY: 0.5,
  ONGOING_BUFFER_DELAY: 0.1,
  PRE_BUFFER_COUNT: 3
};

// Audio playback functions
export const startAudioPlayback = (audioContext: AudioContext) => {
  if (!audioContext || audioState.audioQueue.length === 0 || audioState.isPlaying) return;
  
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  audioState.isPlaying = true;
  const currentTime = audioContext.currentTime;
  audioState.playhead = currentTime + audioConfig.INITIAL_BUFFER_DELAY;
  
  while (audioState.audioQueue.length > 0) {
    const audioBuffer = audioState.audioQueue.shift();
    if (audioBuffer) {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(audioState.playhead);
      audioState.playhead += audioBuffer.duration;
    }
  }
  
  console.log(`Started playback at ${currentTime + audioConfig.INITIAL_BUFFER_DELAY}`);
};

export const processAudioChunk = (audioBuffer: AudioBuffer, audioContext: AudioContext) => {
  if (!audioContext) return;
  
  if (audioState.isFirstChunk) {
    audioState.audioQueue.push(audioBuffer);
    console.log(`Buffering chunk ${audioState.audioQueue.length}/${audioConfig.PRE_BUFFER_COUNT}`);
    
    if (audioState.audioQueue.length >= audioConfig.PRE_BUFFER_COUNT) {
      startAudioPlayback(audioContext);
      audioState.isFirstChunk = false;
    }
  } else {
    const currentTime = audioContext.currentTime;
    
    if (!audioState.playhead || audioState.playhead <= currentTime + audioConfig.ONGOING_BUFFER_DELAY) {
      audioState.playhead = currentTime + audioConfig.ONGOING_BUFFER_DELAY;
    }
    
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(audioState.playhead);
    audioState.playhead += audioBuffer.duration;
    
    console.log(`Scheduled audio at ${audioState.playhead}, duration: ${audioBuffer.duration}`);
  }
};

export const resetAudioState = () => {
  audioState.isFirstChunk = true;
  audioState.audioQueue = [];
  audioState.isPlaying = false;
  audioState.playhead = undefined;
  audioState.leftover = new Uint8Array(0);
};

export const processIncomingAudioData = (data: ArrayBuffer, audioContext: AudioContext) => {
  let newChunk = new Uint8Array(data);
  
  if (audioState.leftover.length > 0) {
    let combined = new Uint8Array(audioState.leftover.length + newChunk.length);
    combined.set(audioState.leftover, 0);
    combined.set(newChunk, audioState.leftover.length);
    newChunk = combined;
    audioState.leftover = new Uint8Array(0);
  }

  if (newChunk.length % 2 !== 0) {
    audioState.leftover = newChunk.slice(-1);
    newChunk = newChunk.slice(0, -1);
  }

  if (newChunk.length === 0) return;

  const pcmData = new Int16Array(newChunk.buffer);
  const float32Array = new Float32Array(pcmData.length);
  
  for (let i = 0; i < pcmData.length; i++) {
    float32Array[i] = pcmData[i] / 32768;
  }

  const sampleRate = 24000;
  const audioBuffer = audioContext.createBuffer(1, float32Array.length, sampleRate);
  audioBuffer.getChannelData(0).set(float32Array);
  
  processAudioChunk(audioBuffer, audioContext);
};

export const handleAudioEndEvent = () => {
  console.log('Audio playback ended - unmuting microphone');
  
  const micControl = getGlobalMicControl();
  if (micControl) {
    micControl.unmute();
    console.log('Microphone unmuted - ready for next input');
  }
};

export const handleAudioError = () => {
  resetAudioState();
  
  const micControl = getGlobalMicControl();
  if (micControl && micControl.isMuted()) {
    micControl.unmute();
    console.log('Audio error - microphone unmuted');
  }
};

// Audio input setup functions
export const setupAudioInput = async (
  audioContext: AudioContext,
  assemblySocket: WebSocket,
  mediaStream: RefObject<MediaStream | null>,
  scriptProcessor: RefObject<ScriptProcessorNode | null>
) => {
  mediaStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });

  const micControl = createMicrophoneControl(mediaStream.current);
  setGlobalMicControl(micControl);

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  console.log('Detected sample rate:', audioContext.sampleRate);

  const source = audioContext.createMediaStreamSource(mediaStream.current);
  scriptProcessor.current = audioContext.createScriptProcessor(4096, 1, 1);

  source.connect(scriptProcessor.current);
  scriptProcessor.current.connect(audioContext.destination);

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

export const cleanupAudioInput = (
  scriptProcessor: RefObject<ScriptProcessorNode | null>,
  mediaStream: RefObject<MediaStream | null>
) => {
  if (scriptProcessor.current) {
    scriptProcessor.current.disconnect();
    scriptProcessor.current = null;
  }

  if (mediaStream.current) {
    mediaStream.current.getTracks().forEach(track => track.stop());
    mediaStream.current = null;
  }
};
