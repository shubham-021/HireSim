import 'dotenv/config'
import express, { NextFunction, Request, Response } from "express";
import cors from 'cors'
import multer from "multer";
import PdfParse from "pdf-parse";
import { clerkClient, requireAuth, getAuth, clerkMiddleware } from '@clerk/express'
import { PrismaClient } from "../src/generated/prisma";

type middlewareParam = {
    req : Request,
    res : Response,
    next : NextFunction
}

const app = express();
app.use(cors())
app.use(clerkMiddleware());
const db = new PrismaClient()

const upload = multer()

// function printMiddle(req:Request , res:Response , next: NextFunction){
//     console.log("here");
//     next();
// }

app.post("/api/upload/resume" ,  requireAuth(), upload.single('file'), async(req,res)=>{
    try {
        const { userId } = getAuth(req)
        // console.log(userId) 
        if(userId){
            const user = await clerkClient.users.getUser(userId)
            // console.log(user)
            if(!user.privateMetadata.dbUserId){
                const newUser = await db.user.create({
                    data:{
                        authid: userId,
                        authProvider: user.externalAccounts[0].provider,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.emailAddresses[0]?.emailAddress,
                        phone: user.externalAccounts[0]?.phoneNumber
                    },
                    select:{
                        id : true
                    }

                })

                await clerkClient.users.updateUserMetadata(userId,{
                    privateMetadata:{
                        dbUserId: newUser.id
                    }
                })
            }
            // else{
            //     await clerkClient.users.updateUserMetadata(userId,{
            //         privateMetadata:{
            //             dbUserId : null
            //         }
            //     })
            // }
        }
        const file = req.file;
        // console.log("here too")
        if(!file){
            return res.status(400).json({"error": "file missing"});
        }

        if(file.mimetype !== "application/pdf"){
            return res.status(400).json({ error: 'Only PDF files are allowed' });
        }

        const buffer = file.buffer;
        const data = await PdfParse(buffer)
        // console.log(data)
        const text = data.text
        // const res = client.resume.create({
        //     data:{
        //         content : text
        //     }
        // })
        // console.log(text)
        const user = await clerkClient.users.getUser(userId as string)
        const user_id = user.privateMetadata.dbUserId as string
        console.log(user_id);
        console.log(text);
        const id = await db.resume.create({
            data:{
                userId: user_id,
                content: text
            },
            select:{
                id: true
            }
        })

        res.status(200).json({"success" : "file uploaded ob db" , "id":id})
    } catch (error) {
        console.log(error);
        res.status(400).json({"error":"Uploading Failed"})
    }
})

app.get('/api/get/resume', requireAuth() , async (req,res) => {
    try {
        const { userId } = getAuth(req)
        if(userId){
            const resume = await db.resume.findFirst({
                where:{user: {authid : userId}},
                select: {content: true}
            })
            return res.status(200).json({"text":resume})
        }else{
            return res.status(400).json({"error":"Cant find any resume"})
        }
    } catch (error) {
        console.log(error)
        return res.status(400).json({"error":"Cant find any resume"})
    }
})

const PORT = process.env.PORT || 8080;
app.listen(PORT , ()=>{
    console.log(`Server running on port: ${PORT}`);
});
