import { Request, Response } from "express";
import ProductModel from "../model/product.model";
import { catchError } from "../utils/err";
import mongoose from "mongoose";
import { 
    CreateProductDto, 
    UpdateProductDto
} from "../dto/product.dto";
import { ValidationService } from "../utils/validation";

const validateObjectId = (id: string) => {
    return mongoose.Types.ObjectId.isValid(id);
};

export const getProduct = async (req: Request, res: Response) =>{
    try {
        const products = await ProductModel.find().sort({createdAt:-1});
        res.json(products);
    } 
    catch (error: unknown) {
        catchError(error, res);
    }
}

export const createProduct = async (req: Request, res: Response) =>{
    try {
        const payload = req.body;
        
        // Validate using DTO for database query safety
        const validation = await ValidationService.validateDto(CreateProductDto, payload);
        
        if (!validation.isValid) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validation.errors.map(err => `${err.field}: ${err.message}`)
            });
        }
        
        // Use validated DTO data for safe database operation
        const product = await ProductModel.create(validation.dto);
        res.status(201).json({
            message: "Product created successfully",
            data: product
        });
    } 
    catch (error: unknown) {
        catchError(error, res);
    }
}
export const updateProduct = async (req: Request, res: Response) =>{
    try {
        const id = req.params.id;
        const payload = req.body;
        
        // Validate ObjectId
        if (!validateObjectId(id)) {
            return res.status(400).json({
                message: "Invalid product ID format"
            });
        }
        
        // Validate using DTO for database query safety
        const validation = await ValidationService.validateDto(UpdateProductDto, payload);
        
        if (!validation.isValid) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validation.errors.map(err => `${err.field}: ${err.message}`)
            });
        }

        // Use validated DTO data for safe database operation
        const product = await ProductModel.findByIdAndUpdate(
            new mongoose.Types.ObjectId(id), 
            validation.dto, 
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ message: "Product Not Found" });
        }
        
        res.json({
            message: "Product updated successfully",
            data: product
        });
    }
    catch (error: unknown) {
        catchError(error, res);
    }
}
export const deleteProduct = async (req: Request, res: Response) =>{
    try {
        const id = req.params.id;
        
        // Validate ObjectId for safe database query
        if (!validateObjectId(id)) {
            return res.status(400).json({
                message: "Invalid product ID format"
            });
        }
        
        const product = await ProductModel.findByIdAndDelete(new mongoose.Types.ObjectId(id));
        
        if (!product) {
            return res.status(404).json({ message: "Product Not Found" });
        }
        
        res.json({ message: "Product deleted successfully" });
    }
    catch (error: unknown) {
        catchError(error, res);
    }
}