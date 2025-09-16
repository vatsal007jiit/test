// Test-friendly ValidationService that doesn't use decorators
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

export interface ValidationResult {
  isValid: boolean;
  dto: any;
  errors: Array<{
    field: string;
    message: string;
    value: any;
  }>;
}

export class TestValidationService {
  static async validateDto<T>(
    DtoClass: new () => T,
    plainObject: any
  ): Promise<ValidationResult> {
    try {
      // Transform the plain object to class instance
      const dto = plainToClass(DtoClass, plainObject);
      
      // Validate the DTO
      const errors = await validate(dto as any);
      
      if (errors.length > 0) {
        const formattedErrors = errors.map(error => ({
          field: error.property,
          message: Object.values(error.constraints || {})[0] || 'Invalid value',
          value: error.value,
        }));
        
        return {
          isValid: false,
          dto: plainObject,
          errors: formattedErrors,
        };
      }
      
      return {
        isValid: true,
        dto: plainObject,
        errors: [],
      };
    } catch (error) {
      return {
        isValid: false,
        dto: plainObject,
        errors: [{
          field: 'general',
          message: 'Validation failed',
          value: plainObject,
        }],
      };
    }
  }
}

