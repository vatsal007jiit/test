import { ProductResponseDto, ApiResponseDto, ValidationErrorDto } from '../../dto/product.dto';

describe('Product DTO Constructors', () => {
  describe('ProductResponseDto', () => {
    it('should create ProductResponseDto with valid product data', () => {
      // Arrange
      const productData = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Test Product',
        price: 100,
        discount: 10,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      // Act
      const dto = new ProductResponseDto(productData);

      // Assert
      expect(dto._id).toBe('507f1f77bcf86cd799439011');
      expect(dto.title).toBe('Test Product');
      expect(dto.price).toBe(100);
      expect(dto.discount).toBe(10);
      expect(dto.createdAt).toEqual(new Date('2023-01-01'));
      expect(dto.updatedAt).toEqual(new Date('2023-01-02'));
    });

    it('should create ProductResponseDto with minimal product data', () => {
      // Arrange
      const productData = {
        _id: '507f1f77bcf86cd799439012',
        title: 'Minimal Product',
        price: 50,
        discount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act
      const dto = new ProductResponseDto(productData);

      // Assert
      expect(dto._id).toBe('507f1f77bcf86cd799439012');
      expect(dto.title).toBe('Minimal Product');
      expect(dto.price).toBe(50);
      expect(dto.discount).toBe(0);
      expect(dto.createdAt).toBeInstanceOf(Date);
      expect(dto.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle product data with undefined discount', () => {
      // Arrange
      const productData = {
        _id: '507f1f77bcf86cd799439013',
        title: 'Product Without Discount',
        price: 75,
        discount: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act
      const dto = new ProductResponseDto(productData);

      // Assert
      expect(dto._id).toBe('507f1f77bcf86cd799439013');
      expect(dto.title).toBe('Product Without Discount');
      expect(dto.price).toBe(75);
      expect(dto.discount).toBeUndefined();
      expect(dto.createdAt).toBeInstanceOf(Date);
      expect(dto.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('ApiResponseDto', () => {
    it('should create ApiResponseDto with success response', () => {
      // Arrange
      const success = true;
      const message = 'Operation successful';
      const data = { id: 1, name: 'Test' };

      // Act
      const dto = new ApiResponseDto(success, message, data);

      // Assert
      expect(dto.success).toBe(true);
      expect(dto.message).toBe('Operation successful');
      expect(dto.data).toEqual({ id: 1, name: 'Test' });
      expect(dto.errors).toBeUndefined();
    });

    it('should create ApiResponseDto with error response', () => {
      // Arrange
      const success = false;
      const message = 'Operation failed';
      const errors = ['Error 1', 'Error 2'];

      // Act
      const dto = new ApiResponseDto(success, message, undefined, errors);

      // Assert
      expect(dto.success).toBe(false);
      expect(dto.message).toBe('Operation failed');
      expect(dto.data).toBeUndefined();
      expect(dto.errors).toEqual(['Error 1', 'Error 2']);
    });

    it('should create ApiResponseDto with only success and message', () => {
      // Arrange
      const success = true;
      const message = 'Simple response';

      // Act
      const dto = new ApiResponseDto(success, message);

      // Assert
      expect(dto.success).toBe(true);
      expect(dto.message).toBe('Simple response');
      expect(dto.data).toBeUndefined();
      expect(dto.errors).toBeUndefined();
    });

    it('should create ApiResponseDto with all parameters', () => {
      // Arrange
      const success = false;
      const message = 'Complex response';
      const data = { result: 'test' };
      const errors = ['Validation error'];

      // Act
      const dto = new ApiResponseDto(success, message, data, errors);

      // Assert
      expect(dto.success).toBe(false);
      expect(dto.message).toBe('Complex response');
      expect(dto.data).toEqual({ result: 'test' });
      expect(dto.errors).toEqual(['Validation error']);
    });
  });

  describe('ValidationErrorDto', () => {
    it('should create ValidationErrorDto with all properties', () => {
      // Arrange
      const field = 'title';
      const message = 'Title is required';
      const value = '';

      // Act
      const dto = new ValidationErrorDto(field, message, value);

      // Assert
      expect(dto.field).toBe('title');
      expect(dto.message).toBe('Title is required');
      expect(dto.value).toBe('');
    });

    it('should create ValidationErrorDto with string value', () => {
      // Arrange
      const field = 'price';
      const message = 'Price must be a number';
      const value = 'not-a-number';

      // Act
      const dto = new ValidationErrorDto(field, message, value);

      // Assert
      expect(dto.field).toBe('price');
      expect(dto.message).toBe('Price must be a number');
      expect(dto.value).toBe('not-a-number');
    });

    it('should create ValidationErrorDto with number value', () => {
      // Arrange
      const field = 'discount';
      const message = 'Discount must be between 0 and 100';
      const value = 150;

      // Act
      const dto = new ValidationErrorDto(field, message, value);

      // Assert
      expect(dto.field).toBe('discount');
      expect(dto.message).toBe('Discount must be between 0 and 100');
      expect(dto.value).toBe(150);
    });

    it('should create ValidationErrorDto with null value', () => {
      // Arrange
      const field = 'title';
      const message = 'Title cannot be null';
      const value = null;

      // Act
      const dto = new ValidationErrorDto(field, message, value);

      // Assert
      expect(dto.field).toBe('title');
      expect(dto.message).toBe('Title cannot be null');
      expect(dto.value).toBeNull();
    });

    it('should create ValidationErrorDto with object value', () => {
      // Arrange
      const field = 'metadata';
      const message = 'Metadata must be an object';
      const value = { invalid: 'data' };

      // Act
      const dto = new ValidationErrorDto(field, message, value);

      // Assert
      expect(dto.field).toBe('metadata');
      expect(dto.message).toBe('Metadata must be an object');
      expect(dto.value).toEqual({ invalid: 'data' });
    });

    it('should create ValidationErrorDto with array value', () => {
      // Arrange
      const field = 'tags';
      const message = 'Tags must be an array';
      const value = ['tag1', 'tag2'];

      // Act
      const dto = new ValidationErrorDto(field, message, value);

      // Assert
      expect(dto.field).toBe('tags');
      expect(dto.message).toBe('Tags must be an array');
      expect(dto.value).toEqual(['tag1', 'tag2']);
    });
  });
});
