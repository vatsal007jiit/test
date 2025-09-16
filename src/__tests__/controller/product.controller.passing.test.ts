import { Request, Response } from 'express';
import mongoose from 'mongoose';

// Mock the ProductModel
jest.mock('../../model/product.model', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

// Mock mongoose
jest.mock('mongoose', () => ({
  ...jest.requireActual('mongoose'),
  Types: {
    ObjectId: {
      isValid: jest.fn(),
    },
  },
  default: {
    Types: {
      ObjectId: jest.fn().mockImplementation((id) => ({ toString: () => id })),
    },
  },
}));

// Mock ValidationService completely
jest.mock('../../utils/validation', () => ({
  ValidationService: {
    validateDto: jest.fn(),
  },
}));

import ProductModel from '../../model/product.model';
import { ValidationService } from '../../utils/validation';
import { 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../../controller/product.controller';

describe('Product Controller - Passing Tests', () => {
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
    };
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('getProduct', () => {
    it('should return all products successfully', async () => {
      // Arrange
      const mockProducts = [
        { _id: '1', title: 'Product 1', price: 100 },
        { _id: '2', title: 'Product 2', price: 200 },
      ];

      (ProductModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockProducts),
      });

      // Act
      await getProduct(mockReq as Request, mockRes as Response);

      // Assert
      expect(ProductModel.find).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(mockProducts);
    });

    it('should handle database errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      (ProductModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockRejectedValue(error),
      });

      // Act
      await getProduct(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
    });
  });

  describe('createProduct', () => {
    it('should create a product successfully with valid data', async () => {
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
      
      mockReq.body = productData;
      
      (ValidationService.validateDto as jest.Mock).mockResolvedValue({
        isValid: true,
        dto: productData,
        errors: [],
      });
      
      (ProductModel.create as jest.Mock).mockResolvedValue(mockProduct);

      // Act
      await createProduct(mockReq as Request, mockRes as Response);

      // Assert
      expect(ValidationService.validateDto).toHaveBeenCalled();
      expect(ProductModel.create).toHaveBeenCalledWith(productData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Product created successfully',
        data: mockProduct,
      });
    });

    it('should return validation error for invalid data', async () => {
      // Arrange
      const invalidData = {
        title: '', // Invalid: empty title
        price: -10, // Invalid: negative price
      };
      
      mockReq.body = invalidData;
      
      (ValidationService.validateDto as jest.Mock).mockResolvedValue({
        isValid: false,
        dto: invalidData,
        errors: [
          { field: 'title', message: 'Title is required', value: '' },
          { field: 'price', message: 'Price must be non-negative', value: -10 },
        ],
      });

      // Act
      await createProduct(mockReq as Request, mockRes as Response);

      // Assert
      expect(ValidationService.validateDto).toHaveBeenCalled();
      expect(ProductModel.create).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: [
          'title: Title is required',
          'price: Price must be non-negative',
        ],
      });
    });

    it('should handle database creation errors', async () => {
      // Arrange
      const productData = { title: 'Test Product', price: 100 };
      mockReq.body = productData;
      
      (ValidationService.validateDto as jest.Mock).mockResolvedValue({
        isValid: true,
        dto: productData,
        errors: [],
      });
      
      const error = new Error('Database save failed');
      (ProductModel.create as jest.Mock).mockRejectedValue(error);

      // Act
      await createProduct(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully with valid data', async () => {
      // Arrange
      const productId = '507f1f77bcf86cd799439011';
      const updateData = {
        title: 'Updated Product',
        price: 200,
        discount: 15,
      };
      const updatedProduct = {
        _id: productId,
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockReq.params = { id: productId };
      mockReq.body = updateData;
      
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      (ValidationService.validateDto as jest.Mock).mockResolvedValue({
        isValid: true,
        dto: updateData,
        errors: [],
      });
      (ProductModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedProduct);

      // Act
      await updateProduct(mockReq as Request, mockRes as Response);

      // Assert
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(productId);
      expect(ValidationService.validateDto).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
    });

    it('should return error for invalid product ID', async () => {
      // Arrange
      const invalidId = 'invalid-id';
      mockReq.params = { id: invalidId };
      
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(false);

      // Act
      await updateProduct(mockReq as Request, mockRes as Response);

      // Assert
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(invalidId);
      expect(ValidationService.validateDto).not.toHaveBeenCalled();
      expect(ProductModel.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid product ID format',
      });
    });

    it('should return validation error for invalid update data', async () => {
      // Arrange
      const productId = '507f1f77bcf86cd799439011';
      const invalidData = {
        title: '', // Invalid: empty title
        price: -50, // Invalid: negative price
      };
      
      mockReq.params = { id: productId };
      mockReq.body = invalidData;
      
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      (ValidationService.validateDto as jest.Mock).mockResolvedValue({
        isValid: false,
        dto: invalidData,
        errors: [
          { field: 'title', message: 'Title is required', value: '' },
          { field: 'price', message: 'Price must be non-negative', value: -50 },
        ],
      });

      // Act
      await updateProduct(mockReq as Request, mockRes as Response);

      // Assert
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(productId);
      expect(ValidationService.validateDto).toHaveBeenCalled();
      expect(ProductModel.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: [
          'title: Title is required',
          'price: Price must be non-negative',
        ],
      });
    });

    it('should return 404 when product not found', async () => {
      // Arrange
      const productId = '507f1f77bcf86cd799439011';
      const updateData = { title: 'Updated Product' };
      
      mockReq.params = { id: productId };
      mockReq.body = updateData;
      
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      (ValidationService.validateDto as jest.Mock).mockResolvedValue({
        isValid: true,
        dto: updateData,
        errors: [],
      });
      (ProductModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      // Act
      await updateProduct(mockReq as Request, mockRes as Response);

      // Assert
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(productId);
      expect(ValidationService.validateDto).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
    });

    it('should handle database update errors', async () => {
      // Arrange
      const productId = '507f1f77bcf86cd799439011';
      const updateData = { title: 'Updated Product' };
      
      mockReq.params = { id: productId };
      mockReq.body = updateData;
      
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      (ValidationService.validateDto as jest.Mock).mockResolvedValue({
        isValid: true,
        dto: updateData,
        errors: [],
      });
      
      const error = new Error('Database update failed');
      (ProductModel.findByIdAndUpdate as jest.Mock).mockRejectedValue(error);

      // Act
      await updateProduct(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      // Arrange
      const productId = '507f1f77bcf86cd799439011';
      const deletedProduct = {
        _id: productId,
        title: 'Product to Delete',
        price: 100,
        discount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockReq.params = { id: productId };
      
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      (ProductModel.findByIdAndDelete as jest.Mock).mockResolvedValue(deletedProduct);

      // Act
      await deleteProduct(mockReq as Request, mockRes as Response);

      // Assert
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(productId);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
    });

    it('should return error for invalid product ID', async () => {
      // Arrange
      const invalidId = 'invalid-id';
      mockReq.params = { id: invalidId };
      
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(false);

      // Act
      await deleteProduct(mockReq as Request, mockRes as Response);

      // Assert
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(invalidId);
      expect(ProductModel.findByIdAndDelete).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid product ID format',
      });
    });

    it('should return 404 when product not found', async () => {
      // Arrange
      const productId = '507f1f77bcf86cd799439011';
      
      mockReq.params = { id: productId };
      
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      (ProductModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      // Act
      await deleteProduct(mockReq as Request, mockRes as Response);

      // Assert
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(productId);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
    });

    it('should handle database deletion errors', async () => {
      // Arrange
      const productId = '507f1f77bcf86cd799439011';
      
      mockReq.params = { id: productId };
      
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      
      const error = new Error('Database deletion failed');
      (ProductModel.findByIdAndDelete as jest.Mock).mockRejectedValue(error);

      // Act
      await deleteProduct(mockReq as Request, mockRes as Response);

      // Assert
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(productId);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
    });
  });
});
