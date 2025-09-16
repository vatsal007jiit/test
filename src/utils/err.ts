import { Response } from "express";

export const catchError = (err: unknown, res: Response, prodMessage: string = "Internal server error") => { 
    if(err instanceof Error)
    {
        const message = (process.env.NODE_ENV === 'dev') ? err.message : prodMessage
        res.status(500).json({message})
    }
    
}