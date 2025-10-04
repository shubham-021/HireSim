'use client';

import { useEffect, useRef, useState } from 'react';
import { createAssemblySocket, getToken } from '@/lib/assemblySocket';
import { getServerSocket, sendToServerSocket } from '@/lib/serverSocket';
import { calculateOrderedTranscript } from '@/lib/recordingLogic';
import { cleanupAudioInput } from '@/lib/audioLogic';
import { createMicrophoneControl, setGlobalMicControl } from '@/lib/microphoneControl';
import useStore from '@/store/store';
import { navigateStore } from '@/store/store';
import { MultiStepLoader as Loader } from "@/components/ui/multi-step-loader";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from 'next/navigation';

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

  const router = useRouter();
  const shouldNavigateTo = navigateStore(state => state.shouldNavigate);

  useEffect(() => {
    if (shouldNavigateTo) {
      router.push('/results');
      navigateStore.setState({shouldNavigate: false});
    }
  },[shouldNavigateTo])

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
  const isArrayTranscript = Array.isArray(orderedTranscript);

  if(!loaded) {
    return(
      <div className='w-screen h-screen'>
        <Loader loadingStates={loadingStates} loading={!loaded} duration={2000} />
      </div>
    );
  }

  return (
    <div className={cn('min-h-dvh flex flex-col') }>
      <main className={cn('flex-1 pt-16') }>
        <section className={cn('border-b bg-gradient-to-b from-primary/10 to-transparent') }>
          <div className={cn('mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-10') }>
            <h1 className={cn('text-2xl md:text-3xl font-semibold tracking-tight') }>Live interview</h1>
            <p className={cn('mt-1 text-sm text-muted-foreground max-w-2xl') }>Answer in real time. Your transcript and AI responses appear side by side.</p>
          </div>
        </section>
        <div className={cn('mx-auto max-w-6xl px-4 md:px-6 py-8 grid lg:grid-cols-3 gap-6') }>
          <div className={cn('lg:col-span-2 rounded-2xl border bg-card text-card-foreground shadow p-6') }>
            <div className={cn('flex items-center justify-between gap-4') }>
              <h1 className={cn('text-xl md:text-2xl font-semibold') }>Interview</h1>
              <div className={cn('text-xs text-muted-foreground') }>{isRecording ? 'Recording...' : micReady ? 'Ready' : 'Initializing...'}</div>
            </div>
            <div className={cn('mt-4 flex items-center gap-3') }>
              <button 
                onClick={handleStartRecording} 
                disabled={!micReady || isRecording}
                className={cn('inline-flex items-center justify-center rounded-md text-sm font-medium', !micReady || isRecording ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground hover:opacity-90', 'px-4 py-2')}
              >
                {!micReady ? 'Setting up...' : isRecording ? 'Recording...' : 'Start'}
              </button>
              <button 
                onClick={handleStopRecording}
                className={cn('inline-flex items-center justify-center rounded-md text-sm font-medium bg-destructive text-white hover:opacity-90', 'px-4 py-2')}
              >
                Stop
              </button>
              <Link href="/results" className={cn('inline-flex items-center justify-center rounded-md text-sm font-medium border hover:bg-accent', 'px-4 py-2') }>
                View results
              </Link>
            </div>
            {isArrayTranscript ? (
              <div className={cn('mt-6 grid md:grid-cols-2 gap-4') }>
                <div className={cn('h-64 md:h-80 rounded-lg border bg-muted/30 p-4 overflow-auto text-sm') }>
                  <div className={cn('text-muted-foreground') }>You</div>
                  <div className={cn('mt-3 space-y-2') }>
                    {(orderedTranscript as any[]).filter((t: any) => t.role === 'user').map((entry: any, idx: number) => (
                      <div key={idx} className={cn('flex items-start gap-2') }>
                        <span className={cn('shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium bg-primary text-primary-foreground') }>
                          You
                        </span>
                        <p className={cn('leading-relaxed') }>{entry.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={cn('h-64 md:h-80 rounded-lg border bg-muted/30 p-4 overflow-auto text-sm') }>
                  <div className={cn('text-muted-foreground') }>AI</div>
                  <div className={cn('mt-3 space-y-2') }>
                    {(orderedTranscript as any[]).filter((t: any) => t.role !== 'user').map((entry: any, idx: number) => (
                      <div key={idx} className={cn('flex items-start gap-2') }>
                        <span className={cn('shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium bg-accent text-foreground') }>
                          AI
                        </span>
                        <p className={cn('leading-relaxed') }>{entry.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className={cn('mt-6') }>
                <div className={cn('h-64 md:h-80 rounded-lg border bg-muted/30 p-4 overflow-auto text-sm') }>
                  <div className={cn('text-muted-foreground') }>Transcript</div>
                  <p className={cn('mt-3 leading-relaxed whitespace-pre-wrap') }>{orderedTranscript as unknown as string}</p>
                </div>
              </div>
            )}
          </div>
          <aside className={cn('lg:col-span-1 space-y-6') }>
            <div className={cn('rounded-2xl border bg-card text-card-foreground shadow p-6') }>
              <h2 className={cn('font-medium') }>Tips</h2>
              <ul className={cn('mt-3 text-sm list-disc pl-5 space-y-1 text-muted-foreground') }>
                <li>Speak clearly and at a steady pace.</li>
                <li>Answer concisely and structure your points.</li>
                <li>Pause briefly to think before answering.</li>
              </ul>
            </div>
            <div className={cn('rounded-2xl border bg-card text-card-foreground shadow p-6') }>
              <h2 className={cn('font-medium') }>Session</h2>
              <div className={cn('mt-2 text-sm text-muted-foreground') }>
                Status: {isRecording ? 'Recording' : micReady ? 'Ready' : 'Initializing'}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
