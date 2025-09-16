import { Request, Response } from 'express';

// Mock data
export const mockProduct = {
  _id: '507f1f77bcf86cd799439011',
  title: 'Test Product',
  price: 100,
  discount: 10,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

export const mockProducts = [
  mockProduct,
  {
    _id: '507f1f77bcf86cd799439012',
    title: 'Another Product',
    price: 200,
    discount: 0,
    createdAt: new Date('2024-01-02T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
  },
];

// Mock request and response objects
export const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
  body: {},
  params: {},
  query: {},
  ...overrides,
});

export const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res;
};

// Mock ProductModel
export const mockProductModel = {
  find: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

// Reset all mocks
export const resetMocks = () => {
  jest.clearAllMocks();
  Object.values(mockProductModel).forEach(mock => {
    if (typeof mock === 'function') {
      mock.mockClear();
    }
  });
};
