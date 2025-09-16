import { IsString, IsNumber, IsOptional, Min, Max, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

// Base Product DTO
export class BaseProductDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(100)
    title: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    discount?: number;
}

// Create Product DTO
export class CreateProductDto extends BaseProductDto {}

// Update Product DTO (all fields optional)
export class UpdateProductDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(100)
    title?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    discount?: number;
}

// Response DTOs
export class ProductResponseDto {
    _id: string;
    title: string;
    price: number;
    discount: number;
    createdAt: Date;
    updatedAt: Date;

    constructor(product: any) {
        this._id = product._id;
        this.title = product.title;
        this.price = product.price;
        this.discount = product.discount;
        this.createdAt = product.createdAt;
        this.updatedAt = product.updatedAt;
    }
}

export class ApiResponseDto<T> {
    success: boolean;
    message: string;
    data?: T;
    errors?: string[];

    constructor(success: boolean, message: string, data?: T, errors?: string[]) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.errors = errors;
    }
}

// Validation Error DTO
export class ValidationErrorDto {
    field: string;
    message: string;
    value: any;

    constructor(field: string, message: string, value: any) {
        this.field = field;
        this.message = message;
        this.value = value;
    }
}
