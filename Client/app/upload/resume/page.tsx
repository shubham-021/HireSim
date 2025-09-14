"use client"
import UploadUI from "@/ui/upload";
import { MouseEventHandler, useEffect, useState } from "react";
import { useAuth, useUser, SignOutButton, SignedIn, SignedOut } from '@clerk/nextjs'
import axios from "axios";
import { toast } from "sonner"
// import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { LoaderFive } from "@/components/ui/loader";
import { getServerSocket, sendToServerSocket } from "@/lib/serverSocket";

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

        try {
            const token = await getToken()
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
                setFailed(true)
                toast("Failed to upload.")
            }
        } catch (error) {
            console.error(error);
        } finally{
            setIsUploading(false)
            setSelectedFile(null)
        }
    }

    const handleInterview = async () => {
        try {
            const token = await getToken()
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
        <div className="h-screen max-w-4xl flex flex-col justify-center items-center">
            <div className="w-full flex flex-col items-center gap-5">
                <div onClick={handleResumeUpload} className="w-90 h-40 bg-amber-50/10 flex justify-center items-center border-sky-400 border-2 border-dashed rounded-md cursor-pointer">
                    <UploadUI className="text-black flex flex-col justify-center items-center gap-5"/>
                </div>
                {selectedFile && (
                    <div className="text-black flex flex-col items-center">
                        <p>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</p>
                        <button
                            onClick={uploadResume}
                            className="mt-2 px-4 py-1 bg-blue-500 text-black rounded-md cursor-pointer"
                        >
                            {isUploading ? <LoaderFive text="Uploading..."/> : "Upload"}
                        </button>
                    </div>
                )}
                {success && (
                    <button
                        onClick={handleInterview}
                        className="mt-2 px-4 py-1 bg-blue-500 text-black rounded-md cursor-pointer"
                    >
                        Start Interview
                    </button>
                )}
            </div>
        </div>
    )
}