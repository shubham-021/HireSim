import {
  processIncomingAudioData,
  handleAudioEndEvent,
  handleAudioError,
  resetAudioState
} from './audioLogic';
import { getGlobalMicControl } from './microphoneControl';
import useStore from '@/store/store'

interface ServerSocketPackage {
  socket: WebSocket;
  audioContext: AudioContext;
  cleanup: () => void;
  isConnected: () => boolean;
}

// Singleton instances
let serverSocketInstance: WebSocket | null = null;
let audioContextInstance: AudioContext | null = null;

const createNewServerSocket = (): Promise<ServerSocketPackage> => {
  return new Promise((resolve, reject) => {
    try {
      // Create AudioContext if it doesn't exist or is closed
      if (!audioContextInstance || audioContextInstance.state === 'closed') {
        audioContextInstance = new AudioContext();
        console.log('Created new AudioContext');
      }

      // Create new WebSocket
      serverSocketInstance = new WebSocket("ws://localhost:8080/response/audio");
      serverSocketInstance.binaryType = "arraybuffer";

      // Set up connection timeout
      const connectionTimeout = setTimeout(() => {
        if (serverSocketInstance && serverSocketInstance.readyState !== WebSocket.OPEN) {
          serverSocketInstance.close();
          serverSocketInstance = null;
          reject(new Error('WebSocket connection timeout'));
        }
      }, 10000); // 10 second timeout

      // Event handlers
      serverSocketInstance.onopen = (event: Event) => {
        console.log('Server socket connected');
        resetAudioState();
        
        // Clear timeout since connection is successful
        clearTimeout(connectionTimeout);
        
        // Create the package to return
        const packageToReturn: ServerSocketPackage = {
          socket: serverSocketInstance!,
          audioContext: audioContextInstance!,
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
            
            console.log('Server socket package cleaned up');
          },
          isConnected: () => {
            return serverSocketInstance !== null && 
                   serverSocketInstance.readyState === WebSocket.OPEN &&
                   audioContextInstance !== null &&
                   audioContextInstance.state !== 'closed';
          }
        };
        
        // Resolve the promise with the package
        resolve(packageToReturn);
      };

      serverSocketInstance.onmessage = (event: MessageEvent) => {
        // Handle text messages (like audio_end event)
        if (typeof event.data === 'string') {
          try {
            const message = JSON.parse(event.data);
            
            if(message.type === 'load_page'){
              useStore.getState().setLoaded(true)
            }

            if (message.type === 'audio_end' && message.audio === 'ended') {
              handleAudioEndEvent();
              return;
            }
          } catch (error) {
            console.error('Error parsing text message:', error);
          }
        }
        
        // Handle binary audio data
        if (event.data instanceof ArrayBuffer) {
          processIncomingAudioData(event.data, audioContextInstance!);
        }
      };

      serverSocketInstance.onclose = (event: CloseEvent) => {
        console.log('Server socket closed');
        resetAudioState();
        
        // Clear timeout if connection was closed
        clearTimeout(connectionTimeout);
        
        // If connection was closed before opening, reject the promise
        if (event.target === serverSocketInstance && serverSocketInstance?.readyState !== WebSocket.OPEN) {
          serverSocketInstance = null;
          reject(new Error('WebSocket connection closed before establishing'));
          return;
        }
        
        serverSocketInstance = null;
        
        const micControl = getGlobalMicControl();
        if (micControl && micControl.isMuted()) {
          micControl.unmute();
          console.log('Connection closed - microphone unmuted');
        }
      };

      serverSocketInstance.onerror = (error: Event) => {
        console.error('Server socket error:', error);
        handleAudioError();
        
        // Clear timeout and reject promise on error
        clearTimeout(connectionTimeout);
        
        if (serverSocketInstance) {
          serverSocketInstance.close();
          serverSocketInstance = null;
        }
        
        reject(new Error('WebSocket connection error'));
      };

    } catch (error) {
      reject(error);
    }
  });
};

// Main export function - Singleton pattern (now async)
export const getServerSocket = async (): Promise<ServerSocketPackage> => {
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
      },
      isConnected: () => {
        return serverSocketInstance !== null && 
               serverSocketInstance.readyState === WebSocket.OPEN &&
               audioContextInstance !== null &&
               audioContextInstance.state !== 'closed';
      }
    };
  }

  // Create new instance and wait for connection
  console.log('Creating new server socket instance and waiting for connection...');
  return await createNewServerSocket();
};

// Utility function to send messages from any file
export const sendToServerSocket = (message: string) => {
  if (serverSocketInstance && serverSocketInstance.readyState === WebSocket.OPEN) {
    serverSocketInstance.send(message);
    return true;
  }
  console.warn('Server socket not connected, cannot send message');
  return false;
};

// Async version of sendToServerSocket that ensures connection first
export const sendToServerSocketAsync = async (message: string | ArrayBuffer) => {
  try {
    const serverSocket = await getServerSocket();
    if (serverSocket.isConnected()) {
      serverSocket.socket.send(message);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to send message:', error);
    return false;
  }
};

// Force cleanup utility
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
  
  console.log('Forced cleanup of server socket');
};
