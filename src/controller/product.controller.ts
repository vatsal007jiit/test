import { Request, Response } from "express";
import ProductModel from "../model/product.model";
import { catchError } from "../utils/err";

export const getProduct = async (req: Request, res: Response) =>{
    try {
        const products = await ProductModel.find().sort({createdAt:-1})
        res.json(products)
    } 
    catch (error: unknown) {
        catchError(error, res)
    }
}

export const createProduct = async (req: Request, res: Response) =>{
    try {
        const payload = req.body
        await ProductModel.create(payload)
        res.json({message: "Product created successfully"})
    } 
    catch (error: unknown) {
        catchError(error, res)
    }
}
export const updateProduct = async (req: Request, res: Response) =>{
    try {
        const id = req.params.id
        const payload = req.body

        const product = await ProductModel.findByIdAndUpdate(id, payload, {new:true})

        if(!product)
            res.status(404).json({message: "Product Not Found"})
        res.json({message: "Product updated successfully"})
    }
    catch (error: unknown) {
        catchError(error, res)
    }
}
export const deleteProduct = async (req: Request, res: Response) =>{
    try {
       const id = req.params.id
        const product = await ProductModel.findByIdAndDelete(id)
        if(!product)
            res.status(404).json({message: "Product Not Found"})
        res.json({message: "Product deleted successfully"})
    }
    catch (error: unknown) {
        catchError(error, res)
    }
}