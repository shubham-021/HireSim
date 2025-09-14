import { getGlobalMicControl } from './microphone';

interface ServerSocketPackage {
  socket: WebSocket;
  audioContext: AudioContext;
  cleanup: () => void;
  isConnected: () => boolean;
}

// Singleton instances
let serverSocketInstance: WebSocket | null = null;
let audioContextInstance: AudioContext | null = null;

// Audio processing state
let playhead: number | undefined;
let isFirstChunk = true;
let audioQueue: AudioBuffer[] = [];
let isPlaying = false;
const INITIAL_BUFFER_DELAY = 0.5;
const ONGOING_BUFFER_DELAY = 0.1;
const PRE_BUFFER_COUNT = 3;
let leftover = new Uint8Array(0);

const startPlayback = () => {
  if (!audioContextInstance || audioQueue.length === 0 || isPlaying) return;
  
  // Ensure AudioContext is running
  if (audioContextInstance.state === 'suspended') {
    audioContextInstance.resume();
  }
  
  isPlaying = true;
  const currentTime = audioContextInstance.currentTime;
  playhead = currentTime + INITIAL_BUFFER_DELAY;
  
  // Play all buffered chunks
  while (audioQueue.length > 0) {
    const audioBuffer = audioQueue.shift();
    if (audioBuffer) {
      const source = audioContextInstance.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextInstance.destination);
      source.start(playhead);
      playhead += audioBuffer.duration;
    }
  }
  
  console.log(`Started playback at ${currentTime + INITIAL_BUFFER_DELAY}`);
};

const processAudioChunk = (audioBuffer: AudioBuffer) => {
  if (!audioContextInstance) return;
  
  if (isFirstChunk) {
    // Buffer initial chunks for smooth start
    audioQueue.push(audioBuffer);
    console.log(`Buffering chunk ${audioQueue.length}/${PRE_BUFFER_COUNT}`);
    
    if (audioQueue.length >= PRE_BUFFER_COUNT) {
      startPlayback();
      isFirstChunk = false;
    }
  } else {
    // For subsequent chunks, play immediately or queue if needed
    const currentTime = audioContextInstance.currentTime;
    
    if (!playhead || playhead <= currentTime + ONGOING_BUFFER_DELAY) {
      // If playhead is too close to current time, reset it
      playhead = currentTime + ONGOING_BUFFER_DELAY;
    }
    
    const source = audioContextInstance.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextInstance.destination);
    source.start(playhead);
    playhead += audioBuffer.duration;
    
    console.log(`Scheduled audio at ${playhead}, duration: ${audioBuffer.duration}`);
  }
};

const resetAudioState = () => {
  isFirstChunk = true;
  audioQueue = [];
  isPlaying = false;
  playhead = undefined;
  leftover = new Uint8Array(0);
};

const setupSocketEventHandlers = (socket: WebSocket) => {
  socket.onmessage = (event: MessageEvent) => {

    if (typeof event.data === 'string') {
      try {
        const message = JSON.parse(event.data);
        
        // Handle audio_end event from backend
        if (message.type === 'audio_end' && message.audio === 'ended') {
          console.log('Audio playback ended - unmuting microphone');
          
          // Unmute microphone
          const micControl = getGlobalMicControl();
          if (micControl) {
            micControl.unmute();
            console.log('Microphone unmuted - ready for next input');
          }
          
          return;
        }
      } catch (error) {
        console.error('Error parsing text message:', error);
      }
    }
    
    // Handle binary audio data
    if (event.data instanceof ArrayBuffer) {
      let newChunk = new Uint8Array(event.data);
      if (leftover.length > 0) {
        let combined = new Uint8Array(leftover.length + newChunk.length);
        combined.set(leftover, 0);
        combined.set(newChunk, leftover.length);
        newChunk = combined;
        leftover = new Uint8Array(0);
      }

      if (newChunk.length % 2 !== 0) {
        leftover = newChunk.slice(-1);
        newChunk = newChunk.slice(0, -1);
      }

      if (newChunk.length === 0) return;

      const pcmData = new Int16Array(newChunk.buffer);
      const float32Array = new Float32Array(pcmData.length);
      
      for (let i = 0; i < pcmData.length; i++) {
        float32Array[i] = pcmData[i] / 32768;
      }

      const sampleRate = 24000;
      const audioBuffer = audioContextInstance?.createBuffer(1, float32Array.length, sampleRate);
      if (audioBuffer) {
        audioBuffer.getChannelData(0).set(float32Array);
        processAudioChunk(audioBuffer);
      }
    }
  };

  socket.onclose = () => {
    console.log('Server socket closed');
    resetAudioState();
    serverSocketInstance = null;
    
    // Unmute microphone if it was muted when connection closes
    const micControl = getGlobalMicControl();
    if (micControl && micControl.isMuted()) {
      micControl.unmute();
      console.log('Connection closed - microphone unmuted');
    }
  };

  socket.onerror = (error) => {
    console.error('Server socket error:', error);
    resetAudioState();
    
    // Unmute microphone on error
    const micControl = getGlobalMicControl();
    if (micControl && micControl.isMuted()) {
      micControl.unmute();
      console.log('Socket error - microphone unmuted');
    }
  };

  socket.onopen = () => {
    console.log('Server socket connected');
    resetAudioState(); // Reset state on new connection
  };
};

const createNewServerSocket = (): ServerSocketPackage => {
  // Create AudioContext if it doesn't exist or is closed
  if (!audioContextInstance || audioContextInstance.state === 'closed') {
    audioContextInstance = new AudioContext();
    console.log('Created new AudioContext');
  }

  // Create new WebSocket
  serverSocketInstance = new WebSocket("ws://localhost:8080/response/audio");
  serverSocketInstance.binaryType = "arraybuffer";
  
  // Setup event handlers
  setupSocketEventHandlers(serverSocketInstance);
  
  resetAudioState();

  const cleanup = () => {
    if (serverSocketInstance) {
      if (serverSocketInstance.readyState === WebSocket.OPEN) {
        serverSocketInstance.send(JSON.stringify({ type: 'Terminate' }));
      }
      serverSocketInstance.close();
      serverSocketInstance = null;
    }
    
    if (audioContextInstance && audioContextInstance.state !== 'closed') {
      audioContextInstance.close();
      audioContextInstance = null;
    }
    
    resetAudioState();
    
    // Unmute microphone on cleanup
    const micControl = getGlobalMicControl();
    if (micControl && micControl.isMuted()) {
      micControl.unmute();
      console.log('Cleanup - microphone unmuted');
    }
    
    console.log('Server socket package cleaned up');
  };

  const isConnected = () => {
    return serverSocketInstance !== null && 
           serverSocketInstance.readyState === WebSocket.OPEN &&
           audioContextInstance !== null &&
           audioContextInstance.state !== 'closed';
  };

  return {
    socket: serverSocketInstance,
    audioContext: audioContextInstance,
    cleanup,
    isConnected
  };
};

// Main export function - Singleton pattern
export const getServerSocket = (): ServerSocketPackage => {
  // Check if we have a valid existing instance
  if (serverSocketInstance && 
      serverSocketInstance.readyState === WebSocket.OPEN && 
      audioContextInstance && 
      audioContextInstance.state !== 'closed') {
    
    console.log('Returning existing server socket instance');
    
    return {
      socket: serverSocketInstance,
      audioContext: audioContextInstance,
      cleanup: () => {
        if (serverSocketInstance) {
          if (serverSocketInstance.readyState === WebSocket.OPEN) {
            serverSocketInstance.send(JSON.stringify({ type: 'Terminate' }));
          }
          serverSocketInstance.close();
          serverSocketInstance = null;
        }
        
        if (audioContextInstance && audioContextInstance.state !== 'closed') {
          audioContextInstance.close();
          audioContextInstance = null;
        }
        
        resetAudioState();
        
        // Unmute microphone on cleanup
        const micControl = getGlobalMicControl();
        if (micControl && micControl.isMuted()) {
          micControl.unmute();
        }
      },
      isConnected: () => {
        return serverSocketInstance !== null && 
               serverSocketInstance.readyState === WebSocket.OPEN &&
               audioContextInstance !== null &&
               audioContextInstance.state !== 'closed';
      }
    };
  }

  // Create new instance if none exists or current one is invalid
  console.log('Creating new server socket instance');
  return createNewServerSocket();
};

// Utility function to force cleanup (useful for testing or manual cleanup)
export const forceCleanupServerSocket = () => {
  if (serverSocketInstance) {
    if (serverSocketInstance.readyState === WebSocket.OPEN) {
      serverSocketInstance.send(JSON.stringify({ type: 'Terminate' }));
    }
    serverSocketInstance.close();
    serverSocketInstance = null;
  }
  
  if (audioContextInstance && audioContextInstance.state !== 'closed') {
    audioContextInstance.close();
    audioContextInstance = null;
  }
  
  resetAudioState();
  
  // Unmute microphone on force cleanup
  const micControl = getGlobalMicControl();
  if (micControl && micControl.isMuted()) {
    micControl.unmute();
  }
  
  console.log('Forced cleanup of server socket');
};
