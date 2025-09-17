import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator';

// Base Auth DTO
export class BaseAuthDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(50)
    name!: string;

    @IsEmail({}, { message: 'Please enter a valid email' })
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    @MaxLength(100, { message: 'Password must not exceed 100 characters' })
    password!: string;
}

// Create Auth DTO (for signup)
export class CreateAuthDto extends BaseAuthDto {}

// Update Auth DTO (all fields optional)
export class UpdateAuthDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(50)
    name?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Please enter a valid email' })
    @IsNotEmpty()
    email?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    @MaxLength(100, { message: 'Password must not exceed 100 characters' })
    password?: string;
}

// Login DTO
export class LoginDto {
    @IsEmail({}, { message: 'Please enter a valid email' })
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;
}

// Response DTOs
export class AuthResponseDto {
    _id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(auth: any) {
        this._id = auth._id;
        this.name = auth.name;
        this.email = auth.email;
        this.createdAt = auth.createdAt;
        this.updatedAt = auth.updatedAt;
    }
}

export class LoginResponseDto {
    message: string;
    user: {
        id: string;
        email: string;
        name: string;
    };

    constructor(message: string, user: any) {
        this.message = message;
        this.user = {
            id: user.id,
            email: user.email,
            name: user.name
        };
    }
}

// JWT Payload DTO
export class JwtPayloadDto {
    id: string;
    email: string;
    name: string;

    constructor(user: any) {
        this.id = user._id;
        this.email = user.email;
        this.name = user.name;
    }
}

// API Response DTO (reusing from product.dto.ts pattern)
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

// Validation Error DTO (reusing from product.dto.ts pattern)
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
