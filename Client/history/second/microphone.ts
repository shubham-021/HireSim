interface MicrophoneControl {
  mute: () => void;
  unmute: () => void;
  isMuted: () => boolean;
}

let currentMediaStream: MediaStream | null = null;
let isMicMuted = false;

export const createMicrophoneControl = (mediaStream: MediaStream): MicrophoneControl => {
  currentMediaStream = mediaStream;
  
  const mute = () => {
    if (currentMediaStream) {
      currentMediaStream.getAudioTracks().forEach(track => {
        track.enabled = false;
      });
      isMicMuted = true;
      console.log('Microphone muted');
    }
  };

  const unmute = () => {
    if (currentMediaStream) {
      currentMediaStream.getAudioTracks().forEach(track => {
        track.enabled = true;
      });
      isMicMuted = false;
      console.log('Microphone unmuted');
    }
  };

  const isMuted = () => isMicMuted;

  return { mute, unmute, isMuted };
};

// Global reference for cross-module access
let globalMicControl: MicrophoneControl | null = null;

export const setGlobalMicControl = (control: MicrophoneControl) => {
  globalMicControl = control;
};

export const getGlobalMicControl = (): MicrophoneControl | null => {
  return globalMicControl;
};
