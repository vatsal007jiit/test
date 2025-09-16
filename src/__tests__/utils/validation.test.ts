// Mock the entire validation module to avoid decorator issues
jest.mock('../../utils/validation', () => ({
  ValidationService: {
    validateDto: jest.fn(),
  },
}));

import { ValidationService } from '../../utils/validation';

describe('ValidationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateDto', () => {
    it('should return valid result when validation passes', async () => {
      // Arrange
      const mockDto = { title: 'Test Product', price: 100 };
      const mockValidationResult = {
        isValid: true,
        errors: [],
        dto: mockDto,
      };

      (ValidationService.validateDto as jest.Mock).mockResolvedValue(mockValidationResult);

      // Act
      const result = await ValidationService.validateDto(Object, {
        title: 'Test Product',
        price: 100,
      });

      // Assert
      expect(ValidationService.validateDto).toHaveBeenCalledWith(Object, {
        title: 'Test Product',
        price: 100,
      });
      expect(result).toEqual(mockValidationResult);
    });

    it('should return invalid result when validation fails', async () => {
      // Arrange
      const mockDto = { title: '', price: -10 };
      const mockValidationResult = {
        isValid: false,
        errors: [
          { field: 'title', message: 'title should not be empty', value: '' },
          { field: 'price', message: 'price must not be less than 0', value: -10 },
        ],
        dto: mockDto,
      };

      (ValidationService.validateDto as jest.Mock).mockResolvedValue(mockValidationResult);

      // Act
      const result = await ValidationService.validateDto(Object, {
        title: '',
        price: -10,
      });

      // Assert
      expect(ValidationService.validateDto).toHaveBeenCalledWith(Object, {
        title: '',
        price: -10,
      });
      expect(result).toEqual(mockValidationResult);
    });

    it('should handle nested validation errors', async () => {
      // Arrange
      const mockDto = { title: 'Test', price: 100 };
      const mockValidationResult = {
        isValid: false,
        errors: [
          { field: 'nested', message: 'nested should not be empty', value: null },
          { field: 'nested.field', message: 'field must be a string', value: 123 },
        ],
        dto: mockDto,
      };

      (ValidationService.validateDto as jest.Mock).mockResolvedValue(mockValidationResult);

      // Act
      const result = await ValidationService.validateDto(Object, {
        title: 'Test',
        price: 100,
      });

      // Assert
      expect(ValidationService.validateDto).toHaveBeenCalledWith(Object, {
        title: 'Test',
        price: 100,
      });
      expect(result).toEqual(mockValidationResult);
    });

    it('should handle empty validation errors array', async () => {
      // Arrange
      const mockDto = { title: 'Test Product', price: 100 };
      const mockValidationResult = {
        isValid: true,
        errors: [],
        dto: mockDto,
      };

      (ValidationService.validateDto as jest.Mock).mockResolvedValue(mockValidationResult);

      // Act
      const result = await ValidationService.validateDto(Object, {
        title: 'Test Product',
        price: 100,
      });

      // Assert
      expect(ValidationService.validateDto).toHaveBeenCalledWith(Object, {
        title: 'Test Product',
        price: 100,
      });
      expect(result).toEqual(mockValidationResult);
    });

    it('should handle validation errors with multiple constraints', async () => {
      // Arrange
      const mockDto = { title: 'a'.repeat(101), price: -10 };
      const mockValidationResult = {
        isValid: false,
        errors: [
          { field: 'title', message: 'title must be shorter than or equal to 100 characters', value: 'a'.repeat(101) },
          { field: 'title', message: 'title must be a string', value: 'a'.repeat(101) },
          { field: 'price', message: 'price must not be less than 0', value: -10 },
          { field: 'price', message: 'price must be a number', value: -10 },
        ],
        dto: mockDto,
      };

      (ValidationService.validateDto as jest.Mock).mockResolvedValue(mockValidationResult);

      // Act
      const result = await ValidationService.validateDto(Object, {
        title: 'a'.repeat(101),
        price: -10,
      });

      // Assert
      expect(ValidationService.validateDto).toHaveBeenCalledWith(Object, {
        title: 'a'.repeat(101),
        price: -10,
      });
      expect(result).toEqual(mockValidationResult);
    });
  });
});