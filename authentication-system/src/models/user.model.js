import mongoose, { Schema } from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema({
    username: {
        type: String,
        require: true,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        require: true,
        lowercase: true
    },
    fullname: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    avatar: {
        type: String,
        require: true
    },
    isVerified: {
        type: Boolean,
        default: false
    }
})



//hook
userSchema.pre("save", async function (next) {
    if (!this.isModified(password))  next() 

    this.password = await bcrypt.hash(this.password, 10)
})

//methods
userSchema.methods.isPasswordCorrect = async function (password) {
    return bcrypt.compare(password, this.password)
}

// jwt methods
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model('User', userSchema)