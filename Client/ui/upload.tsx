import { Upload } from "lucide-react";

export default function UploadUI({className} : {className : string}){
    return(
        <div className={className}>
            <Upload className="size-10"/>
            <div className="flex flex-col items-center">
                <span>Click here to upload your resume!</span>
                <span className="text-sm opacity-50">Only pdfs are allowed</span>
            </div>
        </div>
    )
}