import { AuthResponseDto, LoginResponseDto, JwtPayloadDto, ApiResponseDto, ValidationErrorDto } from '../../dto/auth.dto';

describe('Auth DTO Constructors', () => {
  describe('AuthResponseDto', () => {
    it('should create AuthResponseDto with valid auth data', () => {
      // Arrange
      const authData = {
        _id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      // Act
      const dto = new AuthResponseDto(authData);

      // Assert
      expect(dto._id).toBe('507f1f77bcf86cd799439011');
      expect(dto.name).toBe('John Doe');
      expect(dto.email).toBe('john@example.com');
      expect(dto.createdAt).toEqual(new Date('2023-01-01'));
      expect(dto.updatedAt).toEqual(new Date('2023-01-02'));
    });

    it('should create AuthResponseDto with minimal auth data', () => {
      // Arrange
      const authData = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Jane Smith',
        email: 'jane@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act
      const dto = new AuthResponseDto(authData);

      // Assert
      expect(dto._id).toBe('507f1f77bcf86cd799439012');
      expect(dto.name).toBe('Jane Smith');
      expect(dto.email).toBe('jane@example.com');
      expect(dto.createdAt).toBeInstanceOf(Date);
      expect(dto.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle auth data with special characters in name', () => {
      // Arrange
      const authData = {
        _id: '507f1f77bcf86cd799439013',
        name: 'José María',
        email: 'jose@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act
      const dto = new AuthResponseDto(authData);

      // Assert
      expect(dto._id).toBe('507f1f77bcf86cd799439013');
      expect(dto.name).toBe('José María');
      expect(dto.email).toBe('jose@example.com');
      expect(dto.createdAt).toBeInstanceOf(Date);
      expect(dto.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('LoginResponseDto', () => {
    it('should create LoginResponseDto with valid user data', () => {
      // Arrange
      const message = 'Login successful';
      const userData = {
        id: '507f1f77bcf86cd799439011',
        email: 'john@example.com',
        name: 'John Doe',
      };

      // Act
      const dto = new LoginResponseDto(message, userData);

      // Assert
      expect(dto.message).toBe('Login successful');
      expect(dto.user.id).toBe('507f1f77bcf86cd799439011');
      expect(dto.user.email).toBe('john@example.com');
      expect(dto.user.name).toBe('John Doe');
    });

    it('should create LoginResponseDto with minimal user data', () => {
      // Arrange
      const message = 'Welcome back';
      const userData = {
        id: '507f1f77bcf86cd799439012',
        email: 'test@test.com',
        name: 'Test User',
      };

      // Act
      const dto = new LoginResponseDto(message, userData);

      // Assert
      expect(dto.message).toBe('Welcome back');
      expect(dto.user.id).toBe('507f1f77bcf86cd799439012');
      expect(dto.user.email).toBe('test@test.com');
      expect(dto.user.name).toBe('Test User');
    });

    it('should create LoginResponseDto with empty message', () => {
      // Arrange
      const message = '';
      const userData = {
        id: '507f1f77bcf86cd799439013',
        email: 'user@example.com',
        name: 'User',
      };

      // Act
      const dto = new LoginResponseDto(message, userData);

      // Assert
      expect(dto.message).toBe('');
      expect(dto.user.id).toBe('507f1f77bcf86cd799439013');
      expect(dto.user.email).toBe('user@example.com');
      expect(dto.user.name).toBe('User');
    });
  });

  describe('JwtPayloadDto', () => {
    it('should create JwtPayloadDto with valid user data', () => {
      // Arrange
      const userData = {
        _id: '507f1f77bcf86cd799439011',
        email: 'john@example.com',
        name: 'John Doe',
      };

      // Act
      const dto = new JwtPayloadDto(userData);

      // Assert
      expect(dto.id).toBe('507f1f77bcf86cd799439011');
      expect(dto.email).toBe('john@example.com');
      expect(dto.name).toBe('John Doe');
    });

    it('should create JwtPayloadDto with minimal user data', () => {
      // Arrange
      const userData = {
        _id: '507f1f77bcf86cd799439012',
        email: 'test@test.com',
        name: 'Test User',
      };

      // Act
      const dto = new JwtPayloadDto(userData);

      // Assert
      expect(dto.id).toBe('507f1f77bcf86cd799439012');
      expect(dto.email).toBe('test@test.com');
      expect(dto.name).toBe('Test User');
    });

    it('should handle user data with special characters', () => {
      // Arrange
      const userData = {
        _id: '507f1f77bcf86cd799439013',
        email: 'josé@example.com',
        name: 'José María',
      };

      // Act
      const dto = new JwtPayloadDto(userData);

      // Assert
      expect(dto.id).toBe('507f1f77bcf86cd799439013');
      expect(dto.email).toBe('josé@example.com');
      expect(dto.name).toBe('José María');
    });

    it('should handle user data with long names', () => {
      // Arrange
      const userData = {
        _id: '507f1f77bcf86cd799439014',
        email: 'longname@example.com',
        name: 'A'.repeat(50), // Maximum length
      };

      // Act
      const dto = new JwtPayloadDto(userData);

      // Assert
      expect(dto.id).toBe('507f1f77bcf86cd799439014');
      expect(dto.email).toBe('longname@example.com');
      expect(dto.name).toBe('A'.repeat(50));
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

    it('should create ApiResponseDto with auth data', () => {
      // Arrange
      const success = true;
      const message = 'User created';
      const data = {
        _id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
      };

      // Act
      const dto = new ApiResponseDto(success, message, data);

      // Assert
      expect(dto.success).toBe(true);
      expect(dto.message).toBe('User created');
      expect(dto.data).toEqual(data);
      expect(dto.errors).toBeUndefined();
    });
  });

  describe('ValidationErrorDto', () => {
    it('should create ValidationErrorDto with all properties', () => {
      // Arrange
      const field = 'email';
      const message = 'Email is required';
      const value = '';

      // Act
      const dto = new ValidationErrorDto(field, message, value);

      // Assert
      expect(dto.field).toBe('email');
      expect(dto.message).toBe('Email is required');
      expect(dto.value).toBe('');
    });

    it('should create ValidationErrorDto with email validation error', () => {
      // Arrange
      const field = 'email';
      const message = 'Please enter a valid email';
      const value = 'invalid-email';

      // Act
      const dto = new ValidationErrorDto(field, message, value);

      // Assert
      expect(dto.field).toBe('email');
      expect(dto.message).toBe('Please enter a valid email');
      expect(dto.value).toBe('invalid-email');
    });

    it('should create ValidationErrorDto with password validation error', () => {
      // Arrange
      const field = 'password';
      const message = 'Password must be at least 6 characters long';
      const value = '123';

      // Act
      const dto = new ValidationErrorDto(field, message, value);

      // Assert
      expect(dto.field).toBe('password');
      expect(dto.message).toBe('Password must be at least 6 characters long');
      expect(dto.value).toBe('123');
    });

    it('should create ValidationErrorDto with name validation error', () => {
      // Arrange
      const field = 'name';
      const message = 'Name is required';
      const value = null;

      // Act
      const dto = new ValidationErrorDto(field, message, value);

      // Assert
      expect(dto.field).toBe('name');
      expect(dto.message).toBe('Name is required');
      expect(dto.value).toBeNull();
    });

    it('should create ValidationErrorDto with complex validation error', () => {
      // Arrange
      const field = 'userData';
      const message = 'User data must be valid';
      const value = { name: '', email: 'invalid' };

      // Act
      const dto = new ValidationErrorDto(field, message, value);

      // Assert
      expect(dto.field).toBe('userData');
      expect(dto.message).toBe('User data must be valid');
      expect(dto.value).toEqual({ name: '', email: 'invalid' });
    });
  });
});
