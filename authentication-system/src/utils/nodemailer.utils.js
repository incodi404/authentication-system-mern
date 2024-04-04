import nodemail from "nodemailer"
import {asynchandler} from "../utils/asynchandler.utils.js"

const transport = nodemail.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
})

const sendMail = asynchandler(async (email, message, purpose="Verify Your Email") => {
    const mailOptions = {
        from: 'youremail@gmail.com',
        to: email,
        subject: purpose,
        html: message
    }

    try {
        transport.sendMail(mailOptions)
    } catch (error) {
        console.log("Error: Email sent failed!")
    }
})

export {sendMail}


