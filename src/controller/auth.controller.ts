import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { CookieOptions, Request, Response } from "express"
import { catchError } from "../utils/err"
import AuthModel from "../model/auth.model"
import { 
    CreateAuthDto, 
    LoginDto,
    AuthResponseDto,
    JwtPayloadDto
} from "../dto/auth.dto"
import { ValidationService } from "../utils/validation"


export const signup = async(req: Request, res: Response) =>{
    try {
        const payload = req.body
        
        // Validate using DTO for database query safety
        const validation = await ValidationService.validateDto(CreateAuthDto, payload);
        
        if (!validation.isValid) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validation.errors.map(err => `${err.field}: ${err.message}`)
            });
        }
        
        // Use validated DTO data for safe database operation
        const user = await AuthModel.create(validation.dto);
        
        // Create response without password
        const userResponse = new AuthResponseDto(user);
        
        res.status(201).json({
            message: "Signup Successful",
            data: userResponse
        });
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
        const payload = req.body
        
        // Validate using DTO for database query safety
        const validation = await ValidationService.validateDto(LoginDto, payload);
        
        if (!validation.isValid) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validation.errors.map(err => `${err.field}: ${err.message}`)
            });
        }
        
        const {email, password} = validation.dto;
        const user = await AuthModel.findOne({email})

        if(!user)
            return res.status(404).send({message: "User not found, Please signup"})

        const isLogin = bcrypt.compareSync(password, user.password)
        if(!isLogin)
            return res.status(401).send({message: " Invalid Credentials"})

        const payload_jwt = new JwtPayloadDto(user);
        const token = jwt.sign(payload_jwt, process.env.JWT_SECRET!, {expiresIn: '1d'})

        res.cookie('accessToken', token, getOptions())
        res.send({message: " Login Successful"})

    } 
    catch (error) {
        catchError(error, res, 'Login Failed')
    }
}