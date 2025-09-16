import { configDotenv } from "dotenv";
configDotenv()

import mongoose from "mongoose";

mongoose.connect(process.env.db as string)
.then(() => console.log("Connected to DB"))
.catch((err) => console.log("Error connection to DB", err))

import express from "express";
import cors from "cors"
import productRouter from "./router/product.router"
import cookieParser from "cookie-parser";

const app = express()
app.listen(process.env.port || 8080)

app.use(cors({
    origin: process.env.CLIENT,
    credentials: true
}))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use('/api/product', productRouter)
