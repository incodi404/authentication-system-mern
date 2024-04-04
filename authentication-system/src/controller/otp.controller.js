/*Endpoint for Input Email: This step collects the user's email address. It's a standard practice and doesn't introduce any security risks on its own.

Generate OTP: Generating OTPs is a common practice for two-factor authentication. Ensure that the OTP generation process is secure, such as using cryptographically secure random number generators.

Save Email and OTP to Database: Storing the email and OTP in a database allows for later verification. Ensure that the database is properly secured, and sensitive information like OTPs are hashed or encrypted before storage.

Generate JWT Token Based on Email: Generating a JWT token based on the user's email address is a standard approach for authentication. Make sure to use secure JWT signing algorithms and store the secret key securely.

Save Token in Cookie: Saving the JWT token in a cookie can simplify subsequent requests. However, be cautious about storing sensitive information in cookies, especially if they are not encrypted or if you're vulnerable to CSRF attacks.

Create Another Endpoint: This step sets up the endpoint for OTP verification.

Retrieve Email from Cookie and OTP from JSON: Extracting the email from the cookie and OTP from the request JSON is straightforward and doesn't introduce significant security risks.

Verify JWT Email Token: Verifying the JWT email token ensures that the user making the request is authenticated. Make sure to use secure JWT verification methods and validate the token's signature, expiration, and issuer.

Check Database for OTP: Retrieving the OTP from the database for comparison is a necessary step for verification. Ensure that the database access is secure and that sensitive information is protected.

Match OTP: Comparing the OTP received in the request with the OTP retrieved from the database ensures that the user possesses the correct OTP. This step is crucial for OTP verification.

Generate Another JWT Token: If the OTP matches, generating another JWT token with a new secret key adds an additional layer of security. Ensure that the new token has appropriate expiration settings and is securely stored.

Return New Token: Returning the new JWT token to the user completes the OTP verification process and grants access to authenticated endpoints. */

import { asynchandler } from "../utils/asynchandler.utils.js"
import { ApiError } from "../utils/ApiError.utils.js"
import { Otp } from "../models/otp.model.js"
import otpGenerator from "otp-generator"
import jwt from "jsonwebtoken"
import { ApiResponse } from "../utils/ApiResponse.utils.js"
import { sendMail } from "../utils/nodemailer.utils.js"


const registerEmail = asynchandler(async (req, res) => {
    const { email } = req.body

    //validation
    if (!email) { return res.status(401).json(ApiError(401, "Email is requires!")) }

    //check for db existance
    const existedUser = await Otp.findOne({ email: email })

    if (existedUser) { return res.status(401).json(ApiError(401, "User already exists!")) }

    const otp = otpGenerator.generate(4)

    const user = await Otp.create({
        email: email,
        otp: otp,
    })

    if (!user) { return res.status(500).json(ApiError(500, "User not created!")) }


    const createdUser = await Otp.findById(user._id).select("-otp")

    try {
        await sendMail(email, `<p>Your OTP is <b>${otp}</b></p>`)
    } catch (error) {
        return res.status(500).json(ApiError(500, "Email not sent!", error))
    }

    const verifyToken = createdUser.generateVerifyToken()


    return res
        .status(200)
        .cookie("verifyToken", verifyToken)
        .json(ApiResponse(200, "User created successfully!", 
        {
            user: createdUser,
            verifyToken: verifyToken
        }))

})

const verifyOtp = asynchandler(async (req, res) => {
    const verifyToken = req.cookies?.verifyToken || req.body.verifyToken

    const { otp } = req.body

    if (!verifyToken) { return res.status(401).json(ApiError(401, "Token not found!")) }

    const decodedToken = jwt.verify(verifyToken, process.env.VERIFY_TOKEN_SECRET)

    if (!decodedToken) { return res.status(401).json(ApiError(401, "Token not valid!")) }

    const user = await Otp.findById(decodedToken?._id)

    if (!user) { return res.status(401).json(ApiError(401, "User not found!")) }

    if (otp !== user.otp) {return res.status(401).json(ApiError(401, "Wrong OTP!"))}

    const verifiedToken = user.verifiedEmailToken()

    if (!verifiedToken) {return res.status(401).json(ApiError(401, "Verified token is not generated!"))}
    

    user.isVerfied = true
    user.otp = ""
    await user.save({validateBeforeSave: false})

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("verifyToken", options)
        .cookie("verifiedToken", verifiedToken, options)
        .json(ApiResponse(200, "OTP verified!", {
            user,
            verifiedToken
        }))

        //{verifiedToken: verifiedToken}

})

export { registerEmail, verifyOtp }