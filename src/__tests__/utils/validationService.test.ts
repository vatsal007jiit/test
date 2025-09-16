// Mock class-validator first
jest.mock('class-validator', () => ({
  validate: jest.fn(),
  ValidationError: class MockValidationError {
    property: string;
    constraints?: Record<string, string>;
    value: any;
    target: any;
    children: any[];

    constructor() {
      this.property = '';
      this.constraints = {};
      this.value = null;
      this.target = {};
      this.children = [];
    }
  },
}));

// Mock class-transformer
jest.mock('class-transformer', () => ({
  plainToClass: jest.fn(),
}));

// Mock the DTO to avoid decorator issues
jest.mock('../../dto/product.dto', () => ({
  ValidationErrorDto: class MockValidationErrorDto {
    field: string;
    message: string;
    value: any;

    constructor(field: string, message: string, value: any) {
      this.field = field;
      this.message = message;
      this.value = value;
    }
  },
}));

import { ValidationService } from '../../utils/validation';
import { ValidationErrorDto } from '../../dto/product.dto';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';

describe('ValidationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateDto', () => {
    it('should return valid result when validation passes', async () => {
      // Arrange
      const mockData = { title: 'Test Product', price: 100 };
      const mockDto = { ...mockData };
      
      (plainToClass as jest.Mock).mockReturnValue(mockDto);
      (validate as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await ValidationService.validateDto(Object, mockData);

      // Assert
      expect(plainToClass).toHaveBeenCalledWith(Object, mockData);
      expect(validate).toHaveBeenCalledWith(mockDto);
      expect(result).toEqual({
        isValid: true,
        errors: [],
        dto: mockDto,
      });
    });

    it('should return invalid result when validation fails', async () => {
      // Arrange
      const mockData = { title: '', price: -10 };
      const mockDto = { ...mockData };
      const mockValidationErrors: ValidationError[] = [
        {
          property: 'title',
          constraints: {
            isNotEmpty: 'title should not be empty',
            minLength: 'title must be longer than or equal to 1 characters',
          },
          value: '',
          target: mockDto,
          children: [],
        },
        {
          property: 'price',
          constraints: {
            min: 'price must not be less than 0',
          },
          value: -10,
          target: mockDto,
          children: [],
        },
      ];
      
      (plainToClass as jest.Mock).mockReturnValue(mockDto);
      (validate as jest.Mock).mockResolvedValue(mockValidationErrors);

      // Act
      const result = await ValidationService.validateDto(Object, mockData);

      // Assert
      expect(plainToClass).toHaveBeenCalledWith(Object, mockData);
      expect(validate).toHaveBeenCalledWith(mockDto);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3); // 2 properties with constraints
      expect(result.errors[0]).toEqual(new ValidationErrorDto('title', 'title should not be empty', ''));
      expect(result.errors[1]).toEqual(new ValidationErrorDto('title', 'title must be longer than or equal to 1 characters', ''));
      expect(result.errors[2]).toEqual(new ValidationErrorDto('price', 'price must not be less than 0', -10));
    });

    it('should handle nested validation errors', async () => {
      // Arrange
      const mockData = { title: 'Test', price: 100 };
      const mockDto = { ...mockData };
      const mockValidationErrors: ValidationError[] = [
        {
          property: 'nested',
          constraints: {
            isNotEmpty: 'nested should not be empty',
          },
          value: null,
          target: mockDto,
          children: [
            {
              property: 'field',
              constraints: {
                isString: 'field must be a string',
              },
              value: 123,
              target: {},
              children: [],
            },
          ],
        },
      ];
      
      (plainToClass as jest.Mock).mockReturnValue(mockDto);
      (validate as jest.Mock).mockResolvedValue(mockValidationErrors);

      // Act
      const result = await ValidationService.validateDto(Object, mockData);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2); // parent + child error
      expect(result.errors[0]).toEqual(new ValidationErrorDto('nested', 'nested should not be empty', null));
      expect(result.errors[1]).toEqual(new ValidationErrorDto('nested.field', 'field must be a string', 123));
    });

    it('should handle validation errors without constraints', async () => {
      // Arrange
      const mockData = { title: 'Test', price: 100 };
      const mockDto = { ...mockData };
      const mockValidationErrors: ValidationError[] = [
        {
          property: 'field',
          constraints: undefined,
          value: 'test',
          target: mockDto,
          children: [],
        },
      ];
      
      (plainToClass as jest.Mock).mockReturnValue(mockDto);
      (validate as jest.Mock).mockResolvedValue(mockValidationErrors);

      // Act
      const result = await ValidationService.validateDto(Object, mockData);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(0); // No constraints, no errors added
    });

    it('should handle deeply nested validation errors', async () => {
      // Arrange
      const mockData = { title: 'Test', price: 100 };
      const mockDto = { ...mockData };
      const mockValidationErrors: ValidationError[] = [
        {
          property: 'level1',
          constraints: {
            isNotEmpty: 'level1 should not be empty',
          },
          value: null,
          target: mockDto,
          children: [
            {
              property: 'level2',
              constraints: {
                isString: 'level2 must be a string',
              },
              value: 123,
              target: {},
              children: [
                {
                  property: 'level3',
                  constraints: {
                    isNumber: 'level3 must be a number',
                  },
                  value: 'not-a-number',
                  target: {},
                  children: [],
                },
              ],
            },
          ],
        },
      ];
      
      (plainToClass as jest.Mock).mockReturnValue(mockDto);
      (validate as jest.Mock).mockResolvedValue(mockValidationErrors);

      // Act
      const result = await ValidationService.validateDto(Object, mockData);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3); // level1 + level2 + level3
      expect(result.errors[0]).toEqual(new ValidationErrorDto('level1', 'level1 should not be empty', null));
      expect(result.errors[1]).toEqual(new ValidationErrorDto('level1.level2', 'level2 must be a string', 123));
      expect(result.errors[2]).toEqual(new ValidationErrorDto('level1.level2.level3', 'level3 must be a number', 'not-a-number'));
    });

    it('should handle empty validation errors array', async () => {
      // Arrange
      const mockData = { title: 'Test Product', price: 100 };
      const mockDto = { ...mockData };
      
      (plainToClass as jest.Mock).mockReturnValue(mockDto);
      (validate as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await ValidationService.validateDto(Object, mockData);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.dto).toEqual(mockDto);
    });

    it('should handle validation errors with multiple constraints per property', async () => {
      // Arrange
      const mockData = { title: 'a'.repeat(101), price: -10 };
      const mockDto = { ...mockData };
      const mockValidationErrors: ValidationError[] = [
        {
          property: 'title',
          constraints: {
            maxLength: 'title must be shorter than or equal to 100 characters',
            isString: 'title must be a string',
          },
          value: 'a'.repeat(101),
          target: mockDto,
          children: [],
        },
        {
          property: 'price',
          constraints: {
            min: 'price must not be less than 0',
            isNumber: 'price must be a number',
          },
          value: -10,
          target: mockDto,
          children: [],
        },
      ];
      
      (plainToClass as jest.Mock).mockReturnValue(mockDto);
      (validate as jest.Mock).mockResolvedValue(mockValidationErrors);

      // Act
      const result = await ValidationService.validateDto(Object, mockData);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(4); // 2 properties × 2 constraints each
      expect(result.errors[0]).toEqual(new ValidationErrorDto('title', 'title must be shorter than or equal to 100 characters', 'a'.repeat(101)));
      expect(result.errors[1]).toEqual(new ValidationErrorDto('title', 'title must be a string', 'a'.repeat(101)));
      expect(result.errors[2]).toEqual(new ValidationErrorDto('price', 'price must not be less than 0', -10));
      expect(result.errors[3]).toEqual(new ValidationErrorDto('price', 'price must be a number', -10));
    });
  });
});
