import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateProductDto, UpdateProductDto } from '../../dto/product.dto';

describe('Product DTOs', () => {
  describe('CreateProductDto', () => {
    it('should pass validation with valid data', async () => {
      // Arrange
      const validData = {
        title: 'Test Product',
        price: 100,
        discount: 10,
      };

      // Act
      const dto = plainToClass(CreateProductDto, validData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with missing title', async () => {
      // Arrange
      const invalidData = {
        price: 100,
        discount: 10,
      };

      // Act
      const dto = plainToClass(CreateProductDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('title');
    });

    it('should fail validation with empty title', async () => {
      // Arrange
      const invalidData = {
        title: '',
        price: 100,
        discount: 10,
      };

      // Act
      const dto = plainToClass(CreateProductDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('title');
    });

    it('should fail validation with title too long', async () => {
      // Arrange
      const invalidData = {
        title: 'a'.repeat(101), // 101 characters
        price: 100,
        discount: 10,
      };

      // Act
      const dto = plainToClass(CreateProductDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('title');
    });

    it('should fail validation with missing price', async () => {
      // Arrange
      const invalidData = {
        title: 'Test Product',
        discount: 10,
      };

      // Act
      const dto = plainToClass(CreateProductDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('price');
    });

    it('should fail validation with negative price', async () => {
      // Arrange
      const invalidData = {
        title: 'Test Product',
        price: -10,
        discount: 10,
      };

      // Act
      const dto = plainToClass(CreateProductDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('price');
    });

    it('should fail validation with invalid price type', async () => {
      // Arrange
      const invalidData = {
        title: 'Test Product',
        price: 'not-a-number',
        discount: 10,
      };

      // Act
      const dto = plainToClass(CreateProductDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('price');
    });

    it('should fail validation with negative discount', async () => {
      // Arrange
      const invalidData = {
        title: 'Test Product',
        price: 100,
        discount: -5,
      };

      // Act
      const dto = plainToClass(CreateProductDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('discount');
    });

    it('should fail validation with discount over 100', async () => {
      // Arrange
      const invalidData = {
        title: 'Test Product',
        price: 100,
        discount: 150,
      };

      // Act
      const dto = plainToClass(CreateProductDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('discount');
    });

    it('should pass validation with valid discount range', async () => {
      // Arrange
      const validData = {
        title: 'Test Product',
        price: 100,
        discount: 50, // Valid range: 0-100
      };

      // Act
      const dto = plainToClass(CreateProductDto, validData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should pass validation without discount (optional field)', async () => {
      // Arrange
      const validData = {
        title: 'Test Product',
        price: 100,
        // discount is optional
      };

      // Act
      const dto = plainToClass(CreateProductDto, validData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });
  });

  describe('UpdateProductDto', () => {
    it('should pass validation with all fields', async () => {
      // Arrange
      const validData = {
        title: 'Updated Product',
        price: 200,
        discount: 15,
      };

      // Act
      const dto = plainToClass(UpdateProductDto, validData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with only title', async () => {
      // Arrange
      const validData = {
        title: 'Updated Product',
      };

      // Act
      const dto = plainToClass(UpdateProductDto, validData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with only price', async () => {
      // Arrange
      const validData = {
        price: 200,
      };

      // Act
      const dto = plainToClass(UpdateProductDto, validData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with only discount', async () => {
      // Arrange
      const validData = {
        discount: 20,
      };

      // Act
      const dto = plainToClass(UpdateProductDto, validData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with empty object (all fields optional)', async () => {
      // Arrange
      const validData = {};

      // Act
      const dto = plainToClass(UpdateProductDto, validData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with empty title', async () => {
      // Arrange
      const invalidData = {
        title: '',
        price: 200,
      };

      // Act
      const dto = plainToClass(UpdateProductDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('title');
    });

    it('should fail validation with negative price', async () => {
      // Arrange
      const invalidData = {
        price: -50,
      };

      // Act
      const dto = plainToClass(UpdateProductDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('price');
    });

    it('should fail validation with invalid discount', async () => {
      // Arrange
      const invalidData = {
        discount: 150, // Over 100
      };

      // Act
      const dto = plainToClass(UpdateProductDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('discount');
    });
  });
});

