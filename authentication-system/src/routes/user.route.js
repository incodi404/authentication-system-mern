import { Router } from "express";
import { register } from "../controller/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { registerEmail, verifyOtp } from "../controller/otp.controller.js";

const userRouter = Router()

userRouter.route("/register").post(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    }
]), register)

userRouter.route("/register-email").post(registerEmail)
userRouter.route("/verify-otp").post(verifyOtp)

export {userRouter}