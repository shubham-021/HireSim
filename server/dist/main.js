"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const express_2 = require("@clerk/express");
const prisma_1 = require("../src/generated/prisma");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, express_2.clerkMiddleware)());
const db = new prisma_1.PrismaClient();
const upload = (0, multer_1.default)();
// function printMiddle(req:Request , res:Response , next: NextFunction){
//     console.log("here");
//     next();
// }
app.post("/api/upload/resume", (0, express_2.requireAuth)(), upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { userId } = (0, express_2.getAuth)(req);
        // console.log(userId) 
        if (userId) {
            const user = yield express_2.clerkClient.users.getUser(userId);
            // console.log(user)
            if (!user.privateMetadata.dbUserId) {
                const newUser = yield db.user.create({
                    data: {
                        authid: userId,
                        authProvider: user.externalAccounts[0].provider,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: (_a = user.emailAddresses[0]) === null || _a === void 0 ? void 0 : _a.emailAddress,
                        phone: (_b = user.externalAccounts[0]) === null || _b === void 0 ? void 0 : _b.phoneNumber
                    },
                    select: {
                        id: true
                    }
                });
                yield express_2.clerkClient.users.updateUserMetadata(userId, {
                    privateMetadata: {
                        dbUserId: newUser.id
                    }
                });
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
        if (!file) {
            return res.status(400).json({ "error": "file missing" });
        }
        if (file.mimetype !== "application/pdf") {
            return res.status(400).json({ error: 'Only PDF files are allowed' });
        }
        const buffer = file.buffer;
        const data = yield (0, pdf_parse_1.default)(buffer);
        // console.log(data)
        const text = data.text;
        // const res = client.resume.create({
        //     data:{
        //         content : text
        //     }
        // })
        // console.log(text)
        const user = yield express_2.clerkClient.users.getUser(userId);
        const user_id = user.privateMetadata.dbUserId;
        console.log(user_id);
        console.log(text);
        const id = yield db.resume.create({
            data: {
                userId: user_id,
                content: text
            },
            select: {
                id: true
            }
        });
        res.status(200).json({ "success": "file uploaded ob db", "id": id });
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ "error": "Uploading Failed" });
    }
}));
app.get('/api/get/resume', (0, express_2.requireAuth)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = (0, express_2.getAuth)(req);
        if (userId) {
            const resume = yield db.resume.findFirst({
                where: { user: { authid: userId } },
                select: { content: true }
            });
            return res.status(200).json({ "text": resume });
        }
        else {
            return res.status(400).json({ "error": "Cant find any resume" });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({ "error": "Cant find any resume" });
    }
}));
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});
