import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import productRouter from '../../router/product.router';

// Mock mongoose
jest.mock('mongoose', () => ({
  ...jest.requireActual('mongoose'),
  connect: jest.fn(),
  connection: {
    readyState: 1,
  },
  Types: {
    ObjectId: {
      isValid: jest.fn(),
    },
  },
}));

// Mock ProductModel
jest.mock('../../model/product.model', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

// Mock ValidationService
jest.mock('../../utils/validation', () => ({
  ValidationService: {
    validateDto: jest.fn(),
  },
}));

import ProductModel from '../../model/product.model';
import { ValidationService } from '../../utils/validation';

describe('Product Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/products', productRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset ValidationService mock
    (ValidationService.validateDto as jest.Mock).mockClear();
    (ValidationService.validateDto as jest.Mock).mockResolvedValue({
      isValid: true,
      dto: {},
      errors: [],
    });
  });

  describe('GET /api/products', () => {
    it('should return all products', async () => {
      // Arrange
      const mockProducts = [
        {
          _id: '507f1f77bcf86cd799439011',
          title: 'Test Product 1',
          price: 100,
          discount: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: '507f1f77bcf86cd799439012',
          title: 'Test Product 2',
          price: 200,
          discount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (ProductModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockProducts),
      });

      // Act
      const response = await request(app).get('/api/products');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        _id: '507f1f77bcf86cd799439011',
        title: 'Test Product 1',
        price: 100,
        discount: 10,
      });
      expect(response.body[1]).toMatchObject({
        _id: '507f1f77bcf86cd799439012',
        title: 'Test Product 2',
        price: 200,
        discount: 0,
      });
    });

    it('should handle database errors', async () => {
      // Arrange
      (ProductModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      // Act
      const response = await request(app).get('/api/products');

      // Assert
      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/products', () => {
    it('should create a product with valid data', async () => {
      // Arrange
      const productData = {
        title: 'New Product',
        price: 150,
        discount: 5,
      };

      const mockProduct = {
        _id: '507f1f77bcf86cd799439011',
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (ValidationService.validateDto as jest.Mock).mockResolvedValue({
        isValid: true,
        dto: productData,
        errors: [],
      });

      (ProductModel.create as jest.Mock).mockResolvedValue(mockProduct);

      // Act
      const response = await request(app)
        .post('/api/products')
        .send(productData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        message: 'Product created successfully',
        data: {
          _id: '507f1f77bcf86cd799439011',
          title: 'New Product',
          price: 150,
          discount: 5,
        },
      });
    });

    it('should return validation error for invalid data', async () => {
      // Arrange
      const invalidData = {
        title: '', // Invalid: empty title
        price: -10, // Invalid: negative price
      };

      (ValidationService.validateDto as jest.Mock).mockResolvedValue({
        isValid: false,
        dto: invalidData,
        errors: [
          { field: 'title', message: 'Title is required', value: '' },
          { field: 'price', message: 'Price must be non-negative', value: -10 },
        ],
      });

      // Act
      const response = await request(app)
        .post('/api/products')
        .send(invalidData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: 'Validation failed',
        errors: [
          'title: Title is required',
          'price: Price must be non-negative',
        ],
      });
    });

    it('should handle database creation errors', async () => {
      // Arrange
      const productData = {
        title: 'New Product',
        price: 150,
        discount: 5,
      };

      (ValidationService.validateDto as jest.Mock).mockResolvedValue({
        isValid: true,
        dto: productData,
        errors: [],
      });

      (ProductModel.create as jest.Mock).mockRejectedValue(new Error('Database save failed'));

      // Act
      const response = await request(app)
        .post('/api/products')
        .send(productData);

      // Assert
      expect(response.status).toBe(500);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update a product with valid data', async () => {
      // Arrange
      const productId = '507f1f77bcf86cd799439011';
      const updateData = {
        title: 'Updated Product',
        price: 200,
      };

      const mockUpdatedProduct = {
        _id: productId,
        ...updateData,
        discount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      (ValidationService.validateDto as jest.Mock).mockResolvedValue({
        isValid: true,
        dto: updateData,
        errors: [],
      });
      (ProductModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedProduct);

      // Act
      const response = await request(app)
        .put(`/api/products/${productId}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'Internal server error',
      });
    });

    it('should return error for invalid product ID', async () => {
      // Arrange
      const invalidId = 'invalid-id';
      const updateData = { title: 'Updated Product' };

      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(false);

      // Act
      const response = await request(app)
        .put(`/api/products/${invalidId}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: 'Invalid product ID format',
      });
    });

    it('should return error when product not found', async () => {
      // Arrange
      const productId = '507f1f77bcf86cd799439011';
      const updateData = { title: 'Updated Product' };

      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      (ValidationService.validateDto as jest.Mock).mockResolvedValue({
        isValid: true,
        dto: updateData,
        errors: [],
      });
      (ProductModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      // Act
      const response = await request(app)
        .put(`/api/products/${productId}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'Internal server error',
      });
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete a product successfully', async () => {
      // Arrange
      const productId = '507f1f77bcf86cd799439011';
      const mockProduct = {
        _id: productId,
        title: 'Test Product',
        price: 100,
        discount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      (ProductModel.findByIdAndDelete as jest.Mock).mockResolvedValue(mockProduct);

      // Act
      const response = await request(app).delete(`/api/products/${productId}`);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'Internal server error',
      });
    });

    it('should return error for invalid product ID', async () => {
      // Arrange
      const invalidId = 'invalid-id';

      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(false);

      // Act
      const response = await request(app).delete(`/api/products/${invalidId}`);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: 'Invalid product ID format',
      });
    });

    it('should return error when product not found', async () => {
      // Arrange
      const productId = '507f1f77bcf86cd799439011';

      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      (ProductModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      // Act
      const response = await request(app).delete(`/api/products/${productId}`);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'Internal server error',
      });
    });
  });
});
