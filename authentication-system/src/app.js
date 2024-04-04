import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express()


app.use(express.json({limit: "20kb"}))
app.use(express.urlencoded({limit: "20kb", extended: true}))
app.use(express.static("public"))
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(cookieParser())

//route import
import { userRouter } from "./routes/user.route.js";

//route
app.use("/api/v1/users", userRouter)


export { app }