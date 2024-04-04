import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";

const otpSchema = new Schema({
    email: {
        type: String,
        require: true
    },
    otp: {
        type: String,
        require: true
    },
    isVerfied: {
        type: Boolean,
        default: false
    },
})

otpSchema.methods.generateVerifyToken = function() {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.VERIFY_TOKEN_SECRET,
        {
            expiresIn: process.env.VERIFY_TOKEN_EXPIRY
        }
    )
}

otpSchema.methods.verifiedEmailToken = function() {
    return jwt.sign(
        {
            email: this.email
        },
        process.env.VERIFIED_TOKEN_SECRET,
        {
            expiresIn: process.env.VERIFIED_TOKEN_EXPIRY
        }
    )
}

export const Otp = mongoose.model("Otp", otpSchema)


