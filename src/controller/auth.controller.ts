import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { CookieOptions, Request, Response } from "express"
import { catchError } from "../util/err"
import AuthModel from "../model/auth.model"


export const signup = async(req: Request, res: Response) =>{
    try {
        const payload = req.body
        await AuthModel.create(payload)
        res.json({message: "Signup Successful"})
    } 
    catch (error) {
        catchError(error, res, 'Signup Failed')
    }
}

const getOptions = (): CookieOptions =>{
    return {
    maxAge : 24 * 3600 * 1000,
    sameSite: process.env.NODE_ENV === 'prod' ? 'none': 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'prod'
    }
}

export const login = async (req: Request, res: Response) =>{
    try {
        const {email, password} = req.body
        const user = await AuthModel.findOne({email})

        if(!user)
            return res.status(404).send({message: "User not found, Please signup"})

        const isLogin = bcrypt.compareSync(password, user.password)
        if(!isLogin)
            return res.status(401).send({message: " Invalid Credentials"})

        const payload = {
            id: user._id,
            email: user.email,
            name: user.name
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET!, {expiresIn: '1d'})

        res.cookie('accessToken', token, getOptions())
        res.send({message: " Login Succesful"})

    } 
    catch (error) {
        catchError(error, res, 'Login Failed')
    }
}