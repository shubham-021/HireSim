"use client"
import UploadUI from "@/ui/upload";
import { useEffect, useState } from "react";
import { useAuth, useUser } from '@clerk/nextjs'
import axios from "axios";
import { toast } from "sonner"
import { useRouter } from "next/navigation";
import { LoaderFive } from "@/components/ui/loader";
import { getServerSocket, sendToServerSocket } from "@/lib/serverSocket";
import { cn } from "@/lib/utils";

interface ResumeResponse{
    text? : {content : string},
    error? : string
}

export default function Upload(){

    const router = useRouter()

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const { isSignedIn, getToken , isLoaded } = useAuth()
    const [success , setSuccess] = useState(false)
    const [failed , setFailed] = useState(false)
    const [isUploading , setIsUploading] = useState(false)
    const { user } = useUser()

    useEffect(()=>{
        if (!isLoaded) return;
        if (!isSignedIn) {
            router.push("/sign-in")
        }
    },[isLoaded , isSignedIn])

    const handleResumeUpload = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault()
        const element = document.createElement('input')
        element.setAttribute('type' , 'file')
        element.setAttribute('accept' , 'application/pdf')
        element.addEventListener('change' , async (event) => {
            const target = event.target as HTMLInputElement;
            if (target.files && target.files.length > 0) {
                setSelectedFile(target.files[0]);
            }
        })
        element.click()
    }

    const uploadResume = async () => {
        setIsUploading(true)
        if (!selectedFile) return alert("Please select a file first");
        const formData = new FormData();
        formData.append("file", selectedFile);

        try {;
            const token = await getToken()
            console.log(token);
            const res = await axios.post('http://localhost:8000/api/upload/resume', 
                formData,
                {
                    headers: {
                        Authorization : `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                }
            })
            console.log(res.data)
            console.log(res)
            if(res.status === 200){
                setSuccess(true)
                toast("Resume uplaoded !!")
            }else{
                throw new Error(`Upload failed with status: ${res.status} and error ${(res.data as any).error}`)
            }
        } catch (error) {
            setFailed(true)
            toast("Failed to upload.")
            console.error(error);
        } finally{
            setIsUploading(false)
            setSelectedFile(null)
        }
    }

    const handleInterview = async () => {
        try {
            const token = await getToken()
            console.log(token);
            const res = await axios.get<ResumeResponse>('http://localhost:8000/api/get/resume',
                {
                    headers: {
                        Authorization : `Bearer ${token}`
                    }
                }
            )
            // console.log(res.data.text)
            const contentSize = (res.data.text?.content)?.trim().length ?? 0
            if(contentSize === 0){
                throw new Error("Resume cant be empty")
            }
            const {isConnected} = await getServerSocket()
            const connected = isConnected()
            console.log(connected)
            if(connected){
                sendToServerSocket(JSON.stringify({"type":"init" , "resume": res.data.text?.content}))
                router.push("/interview")
            }
        } catch (error) {
            console.error(error)
        }
        // sendToServerSocket(JSON.stringify({"type": "interview" , "init":true}))
    }

    return(
        <div className={cn("min-h-dvh flex flex-col") }>
            <main className={cn("flex-1 pt-16") }>
                <section className={cn("border-b bg-gradient-to-b from-primary/10 to-transparent") }>
                    <div className={cn("mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-10") }>
                        <h1 className={cn("text-2xl md:text-3xl font-semibold tracking-tight") }>Upload your resume</h1>
                        <p className={cn("mt-1 text-sm text-muted-foreground max-w-2xl") }>PDF only. We’ll tailor questions to your experience and the roles you’re aiming for.</p>
                    </div>
                </section>
                <div className={cn("mx-auto max-w-6xl px-4 md:px-6 py-8 grid lg:grid-cols-2 gap-6") }>
                    <div className={cn("rounded-2xl border bg-card text-card-foreground shadow p-6 md:p-8") }>
                        <div onClick={handleResumeUpload} className={cn("w-full h-48 md:h-60 border-2 border-dashed rounded-lg cursor-pointer", "flex items-center justify-center", "hover:bg-accent/40") }>
                            <UploadUI className="flex flex-col justify-center items-center gap-3"/>
                        </div>
                        {selectedFile && (
                            <div className={cn("mt-4 rounded-md border p-4 text-sm") }>
                                <p className={cn("truncate") }>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</p>
                                <button
                                    onClick={uploadResume}
                                    className={cn("mt-3 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium", "px-4 py-2 hover:opacity-90")}
                                >
                                    {isUploading ? <LoaderFive text="Uploading..."/> : "Upload"}
                                </button>
                            </div>
                        )}
                        {success && (
                            <div className={cn("mt-6 flex items-center justify-between gap-3") }>
                                <div className={cn("text-sm text-muted-foreground") }>Resume uploaded successfully.</div>
                                <button
                                    onClick={handleInterview}
                                    className={cn("inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium", "px-4 py-2 hover:opacity-90")}
                                >
                                    Start Interview
                                </button>
                            </div>
                        )}
                    </div>
                    <aside className={cn("rounded-2xl border bg-card text-card-foreground shadow p-6 md:p-8 space-y-4") }>
                        <div>
                            <h2 className={cn("font-medium") }>What happens next?</h2>
                            <ol className={cn("mt-2 text-sm list-decimal pl-5 space-y-1 text-muted-foreground") }>
                                <li>We extract key skills and experiences.</li>
                                <li>We generate resume‑aware interview questions.</li>
                                <li>You start a real‑time mock interview.</li>
                            </ol>
                        </div>
                        <div>
                            <h2 className={cn("font-medium") }>Tips</h2>
                            <ul className={cn("mt-2 text-sm list-disc pl-5 space-y-1 text-muted-foreground") }>
                                <li>Use your latest resume.</li>
                                <li>Target a specific role for better questions.</li>
                                <li>Ensure a quiet environment for audio.</li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    )
}