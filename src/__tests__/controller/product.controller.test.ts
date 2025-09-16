import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../../controller/product.controller';
import { ValidationService } from '../../utils/validation';
import { 
  mockProduct, 
  mockProducts, 
  createMockRequest, 
  createMockResponse, 
  resetMocks 
} from '../utils/testUtils';

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

// Mock ValidationService
jest.mock('../../utils/validation', () => ({
  ValidationService: {
    validateDto: jest.fn(),
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
}));

import ProductModel from '../../model/product.model';

describe('Product Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = createMockRequest();
    mockRes = createMockResponse();
    resetMocks();
    // Reset ValidationService mock
    (ValidationService.validateDto as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProduct', () => {
    it('should return all products successfully', async () => {
      // Arrange
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
      expect(ProductModel.find).toHaveBeenCalled();
      // The catchError utility should handle the error
    });
  });

  describe('createProduct', () => {
    it('should create a product successfully with valid data', async () => {
      // Arrange
      const validProductData = {
        title: 'New Product',
        price: 150,
        discount: 5,
      };
      
      mockReq.body = validProductData;
      
      (ValidationService.validateDto as jest.Mock).mockResolvedValue({
        isValid: true,
        dto: validProductData,
        errors: [],
      });
      
      (ProductModel.create as jest.Mock).mockResolvedValue(mockProduct);

      // Act
      await createProduct(mockReq as Request, mockRes as Response);

      // Assert
      expect(ValidationService.validateDto).toHaveBeenCalledWith(
        expect.any(Function),
        validProductData
      );
      expect(ProductModel.create).toHaveBeenCalledWith(validProductData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Product created successfully',
        data: mockProduct,
      });
    });

    it('should return validation error for invalid data', async () => {
      // Arrange
      const invalidProductData = {
        title: '', // Invalid: empty title
        price: -10, // Invalid: negative price
      };
      
      mockReq.body = invalidProductData;
      
      const validationErrors = [
        { field: 'title', message: 'Title is required', value: '' },
        { field: 'price', message: 'Price must be non-negative', value: -10 },
      ];
      
      (ValidationService.validateDto as jest.Mock).mockResolvedValue({
        isValid: false,
        dto: invalidProductData,
        errors: validationErrors,
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
      const validProductData = {
        title: 'New Product',
        price: 150,
        discount: 5,
      };
      
      mockReq.body = validProductData;
      
      (ValidationService.validateDto as jest.Mock).mockResolvedValue({
        isValid: true,
        dto: validProductData,
        errors: [],
      });
      
      const error = new Error('Database save failed');
      (ProductModel.create as jest.Mock).mockRejectedValue(error);

      // Act
      await createProduct(mockReq as Request, mockRes as Response);

      // Assert
      expect(ValidationService.validateDto).toHaveBeenCalled();
      expect(ProductModel.create).toHaveBeenCalledWith(validProductData);
      // The catchError utility should handle the error
    });
  });

  describe('updateProduct', () => {
    it('should update a product successfully with valid data', async () => {
      // Arrange
      const productId = '507f1f77bcf86cd799439011';
      const updateData = {
        title: 'Updated Product',
        price: 200,
      };
      
      mockReq.params = { id: productId };
      mockReq.body = updateData;
      
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      
      (ValidationService.validateDto as jest.Mock).mockResolvedValue({
        isValid: true,
        dto: updateData,
        errors: [],
      });
      
      (ProductModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockProduct);

      // Act
      await updateProduct(mockReq as Request, mockRes as Response);

      // Assert
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(productId);
      expect(ValidationService.validateDto).toHaveBeenCalledWith(
        expect.any(Function),
        updateData
      );
      expect(ProductModel.findByIdAndUpdate).toHaveBeenCalledWith(
        expect.any(Object),
        updateData, // This should match what validation.dto returns
        { new: true, runValidators: true }
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Product updated successfully',
        data: mockProduct,
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

    it('should return error when product not found', async () => {
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
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Product Not Found',
      });
    });

    it('should return validation error for invalid update data', async () => {
      // Arrange
      const productId = '507f1f77bcf86cd799439011';
      const invalidUpdateData = {
        title: '', // Invalid: empty title
        price: -50, // Invalid: negative price
      };
      
      mockReq.params = { id: productId };
      mockReq.body = invalidUpdateData;
      
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      
      const validationErrors = [
        { field: 'title', message: 'Title is required', value: '' },
        { field: 'price', message: 'Price must be non-negative', value: -50 },
      ];
      
      (ValidationService.validateDto as jest.Mock).mockResolvedValue({
        isValid: false,
        dto: invalidUpdateData,
        errors: validationErrors,
      });

      // Act
      await updateProduct(mockReq as Request, mockRes as Response);

      // Assert
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
  });

  describe('deleteProduct', () => {
    it('should delete a product successfully', async () => {
      // Arrange
      const productId = '507f1f77bcf86cd799439011';
      mockReq.params = { id: productId };
      
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      (ProductModel.findByIdAndDelete as jest.Mock).mockResolvedValue(mockProduct);

      // Act
      await deleteProduct(mockReq as Request, mockRes as Response);

      // Assert
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(productId);
      expect(ProductModel.findByIdAndDelete).toHaveBeenCalledWith(
        expect.any(Object)
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Product deleted successfully',
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

    it('should return error when product not found', async () => {
      // Arrange
      const productId = '507f1f77bcf86cd799439011';
      mockReq.params = { id: productId };
      
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      (ProductModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      // Act
      await deleteProduct(mockReq as Request, mockRes as Response);

      // Assert
      expect(ProductModel.findByIdAndDelete).toHaveBeenCalledWith(
        expect.any(Object)
      );
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Product Not Found',
      });
    });

    it('should handle database deletion errors', async () => {
      // Arrange
      const productId = '507f1f77bcf86cd799439011';
      mockReq.params = { id: productId };
      
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      
      const error = new Error('Database delete failed');
      (ProductModel.findByIdAndDelete as jest.Mock).mockRejectedValue(error);

      // Act
      await deleteProduct(mockReq as Request, mockRes as Response);

      // Assert
      expect(ProductModel.findByIdAndDelete).toHaveBeenCalledWith(
        expect.any(Object)
      );
      // The catchError utility should handle the error
    });
  });
});
