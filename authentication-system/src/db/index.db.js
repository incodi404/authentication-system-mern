import mongoose from "mongoose"
import {DB_NAME} from "../constant.js"


const connectDb = async () => {
    try{
        const mongooseConnection = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log("MongoDB is connected!");
        console.log(mongooseConnection.connection.host);
    }
    catch (error) {
        console.log("MongoDB connection error!", process.env.MONGODB_URI);
        console.log(error);
    }
}

export {connectDb}