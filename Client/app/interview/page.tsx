'use client';

import { useEffect, useRef, useState } from 'react';
import { createAssemblySocket, getToken } from '@/lib/assemblySocket';
import { getServerSocket, sendToServerSocket } from '@/lib/serverSocket';
import { calculateOrderedTranscript } from '@/lib/recordingLogic';
import { cleanupAudioInput } from '@/lib/audioLogic';
import { createMicrophoneControl, setGlobalMicControl } from '@/lib/microphoneControl';
import useStore from '@/store/store';
import { MultiStepLoader as Loader } from "@/components/ui/multi-step-loader";

interface Transcripts {
  [key: string]: string;
}

const loadingStates = [
  {text: "Buying a condo"},
  {text: "Travelling in a flight"},
  {text: "Meeting Tyler Durden"},
  {text: "He makes soap"},
  {text: "We goto a bar"},
  {text: "Start a fight"},
  {text: "We like it"},
  {text: "Welcome to F**** C***"},
];

export default function Interview(){
  // Refs
  const assemblySocket = useRef<WebSocket | null>(null);
  const serverSocketPackage = useRef<any>(null);
  const scriptProcessor = useRef<ScriptProcessorNode | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  
  //page load helper
  const loaded = useStore((state) => state.loaded);

  // State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcripts, setTranscripts] = useState<Transcripts>({});
  const [micReady, setMicReady] = useState<boolean>(false);

  useEffect(() => {
    const start = async() => {
      try {
        // Step 1: Get microphone access first
        console.log('Requesting microphone access...');
        mediaStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Step 2: Set up microphone control (this will start muted as per your requirement)
        const micControl = createMicrophoneControl(mediaStream.current);
        setGlobalMicControl(micControl);
        console.log('Microphone control set up and muted initially');
        
        // Step 3: Set up server socket connection
        
        // Step 4: Send start message to backend
        
        
        setMicReady(true);
        console.log('All systems ready');
        
      } catch (error) {
        console.error('Error during initialization:', error);
        alert('Failed to get microphone access or connect to server. Please refresh and try again.');
      }
    };

    start()
    // if(loaded && !micReady) {
    //   start();
    // }
  },[]);
  //  [loaded, micReady]

  // Event handlers
  const handleStartRecording = async (): Promise<void> => {
    if (!micReady) {
      alert('System not ready yet. Please wait a moment.');
      return;
    }
    serverSocketPackage.current = await getServerSocket();
    sendToServerSocket(JSON.stringify({"type":"start"}));
    const token = await getToken();
    if (!token) return;

    try {
      console.log('Starting recording...');
      
      // Create assembly socket (events handled inside assemblySocket.ts)
      // Note: mediaStream and microphone control are already set up
      assemblySocket.current = createAssemblySocket(
        token,
        transcripts,
        setTranscripts,
        serverSocketPackage.current.audioContext,
        mediaStream,
        scriptProcessor,
        handleStopRecording
      );

      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to start recording. Please try again.');
    }
  };

  const handleStopRecording = (): void => {
    setIsRecording(false);

    // Clean up audio input
    cleanupAudioInput(scriptProcessor, mediaStream);

    // Clean up sockets
    if (assemblySocket.current) {
      assemblySocket.current.send(JSON.stringify({ type: 'Terminate' }));
      assemblySocket.current.close();
      assemblySocket.current = null;
    }

    if (serverSocketPackage.current) {
      serverSocketPackage.current.cleanup();
      serverSocketPackage.current = null;
    }
    
    // Reset mic ready state so it can be reinitialized if needed
    setMicReady(false);
  };

  // Computed values
  const orderedTranscript = calculateOrderedTranscript(transcripts);

  if(!loaded) {
    return(
      <div className='w-screen h-screen'>
        <Loader loadingStates={loadingStates} loading={!loaded} duration={2000} />
      </div>
    );
  }

  return (
    <div className='h-screen w-screen bg-black flex flex-col justify-center items-center text-white'>
      <div>Should we start the interview ?</div>
      <div className='flex gap-2'>
        <button 
          onClick={handleStartRecording} 
          disabled={!micReady || isRecording}
          className={`mt-2 px-4 py-1 text-white rounded-md cursor-pointer ${
            !micReady || isRecording ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {!micReady ? 'Setting up...' : isRecording ? 'Recording...' : 'Yes'}
        </button>
        <button className='mt-2 px-4 py-1 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600'>
          No
        </button>
      </div>
      {!micReady && (
        <div className='mt-4 text-sm text-gray-400'>
          Please allow microphone access when prompted
        </div>
      )}
    </div>
  );
}
