import dotenv from "dotenv"
import {connectDb} from "./db/index.db.js"
import { app } from "./app.js"

dotenv.config({
    path: "./.env"
})

connectDb()
.then(() => {
    app.listen(process.env.PORT, () => {
        console.log("Server is listneing on port: ", process.env.PORT);
    })
})
.catch((err) => {
    console.log(err);
})