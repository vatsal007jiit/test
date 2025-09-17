import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock the AuthModel
jest.mock('../../model/auth.model', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compareSync: jest.fn(),
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

// Mock ValidationService completely
jest.mock('../../utils/validation', () => ({
  ValidationService: {
    validateDto: jest.fn(),
  },
}));

import AuthModel from '../../model/auth.model';
import { ValidationService } from '../../utils/validation';
import { signup, login } from '../../controller/auth.controller';

describe('Auth Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
    };
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create user successfully with valid data', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };
      
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockReq.body = userData;
      
      (ValidationService.validateDto as jest.Mock).mockResolvedValue({
        isValid: true,
        dto: userData,
        errors: [],
      });
      
      (AuthModel.create as jest.Mock).mockResolvedValue(mockUser);

      // Act
      await signup(mockReq as Request, mockRes as Response);

      // Assert
      expect(ValidationService.validateDto).toHaveBeenCalled();
      expect(AuthModel.create).toHaveBeenCalledWith(userData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Signup Successful',
        data: expect.objectContaining({
          _id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          email: 'john@example.com',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      });
    });

    it('should return validation error for invalid data', async () => {
      // Arrange
      const invalidData = {
        name: '', // Invalid: empty name
        email: 'invalid-email', // Invalid: invalid email format
        password: '123', // Invalid: password too short
      };
      
      mockReq.body = invalidData;
      
      (ValidationService.validateDto as jest.Mock).mockResolvedValue({
        isValid: false,
        dto: invalidData,
        errors: [
          { field: 'name', message: 'Name is required', value: '' },
          { field: 'email', message: 'Please enter a valid email', value: 'invalid-email' },
          { field: 'password', message: 'Password must be at least 6 characters long', value: '123' },
        ],
      });

      // Act
      await signup(mockReq as Request, mockRes as Response);

      // Assert
      expect(ValidationService.validateDto).toHaveBeenCalled();
      expect(AuthModel.create).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: [
          'name: Name is required',
          'email: Please enter a valid email',
          'password: Password must be at least 6 characters long',
        ],
      });
    });

    it('should handle database creation errors', async () => {
      // Arrange
      const userData = { 
        name: 'Test User', 
        email: 'test@example.com', 
        password: 'password123' 
      };
      mockReq.body = userData;
      
      (ValidationService.validateDto as jest.Mock).mockResolvedValue({
        isValid: true,
        dto: userData,
        errors: [],
      });
      
      const error = new Error('Email already exists');
      (AuthModel.create as jest.Mock).mockRejectedValue(error);

      // Act
      await signup(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Signup Failed',
      });
    });

    it('should handle missing required fields', async () => {
      // Arrange
      const incompleteData = {
        name: 'John Doe',
        // Missing email and password
      };
      
      mockReq.body = incompleteData;
      
      (ValidationService.validateDto as jest.Mock).mockResolvedValue({
        isValid: false,
        dto: incompleteData,
        errors: [
          { field: 'email', message: 'Email is required', value: undefined },
          { field: 'password', message: 'Password is required', value: undefined },
        ],
      });

      // Act
      await signup(mockReq as Request, mockRes as Response);

      // Assert
      expect(ValidationService.validateDto).toHaveBeenCalled();
      expect(AuthModel.create).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: [
          'email: Email is required',
          'password: Password is required',
        ],
      });
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      // Arrange
      const loginData = {
        email: 'john@example.com',
        password: 'password123',
      };
      
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword123',
      };
      
      mockReq.body = loginData;
      
      (ValidationService.validateDto as jest.Mock).mockResolvedValue({
        isValid: true,
        dto: loginData,
        errors: [],
      });
      
      (AuthModel.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

      // Act
      await login(mockReq as Request, mockRes as Response);

      // Assert
      expect(ValidationService.validateDto).toHaveBeenCalled();
      expect(AuthModel.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(bcrypt.compareSync).toHaveBeenCalledWith('password123', 'hashedPassword123');
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '507f1f77bcf86cd799439011',
          email: 'john@example.com',
          name: 'John Doe',
        }),
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      expect(mockRes.cookie).toHaveBeenCalledWith('accessToken', 'mock-jwt-token', expect.any(Object));
      expect(mockRes.send).toHaveBeenCalledWith({ message: ' Login Successful' });
    });

    it('should return validation error for invalid login data', async () => {
      // Arrange
      const invalidData = {
        email: 'invalid-email',
        password: '', // Invalid: empty password
      };
      
      mockReq.body = invalidData;
      
      (ValidationService.validateDto as jest.Mock).mockResolvedValue({
        isValid: false,
        dto: invalidData,
        errors: [
          { field: 'email', message: 'Please enter a valid email', value: 'invalid-email' },
          { field: 'password', message: 'Password is required', value: '' },
        ],
      });

      // Act
      await login(mockReq as Request, mockRes as Response);

      // Assert
      expect(ValidationService.validateDto).toHaveBeenCalled();
      expect(AuthModel.findOne).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: [
          'email: Please enter a valid email',
          'password: Password is required',
        ],
      });
    });

    it('should return 404 when user not found', async () => {
      // Arrange
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };
      
      mockReq.body = loginData;
      
      (ValidationService.validateDto as jest.Mock).mockResolvedValue({
        isValid: true,
        dto: loginData,
        errors: [],
      });
      
      (AuthModel.findOne as jest.Mock).mockResolvedValue(null);

      // Act
      await login(mockReq as Request, mockRes as Response);

      // Assert
      expect(ValidationService.validateDto).toHaveBeenCalled();
      expect(AuthModel.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
      expect(bcrypt.compareSync).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.send).toHaveBeenCalledWith({ message: 'User not found, Please signup' });
    });

    it('should return 401 for invalid credentials', async () => {
      // Arrange
      const loginData = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };
      
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword123',
      };
      
      mockReq.body = loginData;
      
      (ValidationService.validateDto as jest.Mock).mockResolvedValue({
        isValid: true,
        dto: loginData,
        errors: [],
      });
      
      (AuthModel.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(false); // Password doesn't match

      // Act
      await login(mockReq as Request, mockRes as Response);

      // Assert
      expect(ValidationService.validateDto).toHaveBeenCalled();
      expect(AuthModel.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(bcrypt.compareSync).toHaveBeenCalledWith('wrongpassword', 'hashedPassword123');
      expect(jwt.sign).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.send).toHaveBeenCalledWith({ message: ' Invalid Credentials' });
    });

    it('should handle database errors during login', async () => {
      // Arrange
      const loginData = {
        email: 'john@example.com',
        password: 'password123',
      };
      
      mockReq.body = loginData;
      
      (ValidationService.validateDto as jest.Mock).mockResolvedValue({
        isValid: true,
        dto: loginData,
        errors: [],
      });
      
      const error = new Error('Database connection failed');
      (AuthModel.findOne as jest.Mock).mockRejectedValue(error);

      // Act
      await login(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Login Failed',
      });
    });

    it('should handle missing required fields in login', async () => {
      // Arrange
      const incompleteData = {
        email: 'john@example.com',
        // Missing password
      };
      
      mockReq.body = incompleteData;
      
      (ValidationService.validateDto as jest.Mock).mockResolvedValue({
        isValid: false,
        dto: incompleteData,
        errors: [
          { field: 'password', message: 'Password is required', value: undefined },
        ],
      });

      // Act
      await login(mockReq as Request, mockRes as Response);

      // Assert
      expect(ValidationService.validateDto).toHaveBeenCalled();
      expect(AuthModel.findOne).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: [
          'password: Password is required',
        ],
      });
    });
  });
});
