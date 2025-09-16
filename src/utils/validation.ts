import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ValidationErrorDto } from '../dto/product.dto';

export class ValidationService {
    static async validateDto<T extends object>(
        dtoClass: new () => T,
        data: any
    ): Promise<{ isValid: boolean; errors: ValidationErrorDto[]; dto: T }> {
        // Transform plain object to class instance
        const dto = plainToClass(dtoClass, data);
        
        // Validate the DTO
        const validationErrors = await validate(dto);
        
        if (validationErrors.length === 0) {
            return {
                isValid: true,
                errors: [],
                dto
            };
        }
        
        // Transform validation errors to our custom format
        const errors: ValidationErrorDto[] = [];
        this.flattenValidationErrors(validationErrors, errors);
        
        return {
            isValid: false,
            errors,
            dto
        };
    }
    
    private static flattenValidationErrors(
        validationErrors: ValidationError[],
        errors: ValidationErrorDto[],
        parentPath: string = ''
    ): void {
        for (const error of validationErrors) {
            const field = parentPath ? `${parentPath}.${error.property}` : error.property;
            
            if (error.constraints) {
                for (const constraint of Object.values(error.constraints)) {
                    errors.push(new ValidationErrorDto(field, constraint, error.value));
                }
            }
            
            if (error.children && error.children.length > 0) {
                this.flattenValidationErrors(error.children, errors, field);
            }
        }
    }
}
