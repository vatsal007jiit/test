import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateAuthDto, UpdateAuthDto, LoginDto } from '../../dto/auth.dto';

describe('Auth DTOs', () => {
  describe('CreateAuthDto', () => {
    it('should pass validation with valid data', async () => {
      // Arrange
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      // Act
      const dto = plainToClass(CreateAuthDto, validData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with missing name', async () => {
      // Arrange
      const invalidData = {
        email: 'john@example.com',
        password: 'password123',
      };

      // Act
      const dto = plainToClass(CreateAuthDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
    });

    it('should fail validation with empty name', async () => {
      // Arrange
      const invalidData = {
        name: '',
        email: 'john@example.com',
        password: 'password123',
      };

      // Act
      const dto = plainToClass(CreateAuthDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
    });

    it('should fail validation with name too long', async () => {
      // Arrange
      const invalidData = {
        name: 'a'.repeat(51), // 51 characters
        email: 'john@example.com',
        password: 'password123',
      };

      // Act
      const dto = plainToClass(CreateAuthDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
    });

    it('should fail validation with missing email', async () => {
      // Arrange
      const invalidData = {
        name: 'John Doe',
        password: 'password123',
      };

      // Act
      const dto = plainToClass(CreateAuthDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
    });

    it('should fail validation with invalid email format', async () => {
      // Arrange
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123',
      };

      // Act
      const dto = plainToClass(CreateAuthDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
    });

    it('should fail validation with missing password', async () => {
      // Arrange
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      // Act
      const dto = plainToClass(CreateAuthDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
    });

    it('should fail validation with password too short', async () => {
      // Arrange
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '12345', // Less than 6 characters
      };

      // Act
      const dto = plainToClass(CreateAuthDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
    });

    it('should fail validation with password too long', async () => {
      // Arrange
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'a'.repeat(101), // 101 characters
      };

      // Act
      const dto = plainToClass(CreateAuthDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
    });

    it('should pass validation with minimum valid password length', async () => {
      // Arrange
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123456', // Exactly 6 characters
      };

      // Act
      const dto = plainToClass(CreateAuthDto, validData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with maximum valid password length', async () => {
      // Arrange
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'a'.repeat(100), // Exactly 100 characters
      };

      // Act
      const dto = plainToClass(CreateAuthDto, validData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });
  });

  describe('UpdateAuthDto', () => {
    it('should pass validation with all fields', async () => {
      // Arrange
      const validData = {
        name: 'Updated Name',
        email: 'updated@example.com',
        password: 'newpassword123',
      };

      // Act
      const dto = plainToClass(UpdateAuthDto, validData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with only name', async () => {
      // Arrange
      const validData = {
        name: 'Updated Name',
      };

      // Act
      const dto = plainToClass(UpdateAuthDto, validData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with only email', async () => {
      // Arrange
      const validData = {
        email: 'updated@example.com',
      };

      // Act
      const dto = plainToClass(UpdateAuthDto, validData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with only password', async () => {
      // Arrange
      const validData = {
        password: 'newpassword123',
      };

      // Act
      const dto = plainToClass(UpdateAuthDto, validData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with empty object (all fields optional)', async () => {
      // Arrange
      const validData = {};

      // Act
      const dto = plainToClass(UpdateAuthDto, validData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with empty name', async () => {
      // Arrange
      const invalidData = {
        name: '',
        email: 'updated@example.com',
      };

      // Act
      const dto = plainToClass(UpdateAuthDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
    });

    it('should fail validation with invalid email format', async () => {
      // Arrange
      const invalidData = {
        email: 'invalid-email',
      };

      // Act
      const dto = plainToClass(UpdateAuthDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
    });

    it('should fail validation with password too short', async () => {
      // Arrange
      const invalidData = {
        password: '12345', // Less than 6 characters
      };

      // Act
      const dto = plainToClass(UpdateAuthDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
    });
  });

  describe('LoginDto', () => {
    it('should pass validation with valid data', async () => {
      // Arrange
      const validData = {
        email: 'john@example.com',
        password: 'password123',
      };

      // Act
      const dto = plainToClass(LoginDto, validData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with missing email', async () => {
      // Arrange
      const invalidData = {
        password: 'password123',
      };

      // Act
      const dto = plainToClass(LoginDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
    });

    it('should fail validation with invalid email format', async () => {
      // Arrange
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };

      // Act
      const dto = plainToClass(LoginDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
    });

    it('should fail validation with missing password', async () => {
      // Arrange
      const invalidData = {
        email: 'john@example.com',
      };

      // Act
      const dto = plainToClass(LoginDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
    });

    it('should fail validation with empty email', async () => {
      // Arrange
      const invalidData = {
        email: '',
        password: 'password123',
      };

      // Act
      const dto = plainToClass(LoginDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
    });

    it('should fail validation with empty password', async () => {
      // Arrange
      const invalidData = {
        email: 'john@example.com',
        password: '',
      };

      // Act
      const dto = plainToClass(LoginDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
    });

    it('should pass validation with minimal valid data', async () => {
      // Arrange
      const validData = {
        email: 'test@test.com',
        password: '123456',
      };

      // Act
      const dto = plainToClass(LoginDto, validData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });
  });
});
