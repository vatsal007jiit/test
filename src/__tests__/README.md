# Test Suite Documentation

This directory contains comprehensive unit and integration tests for the Product API.

## Test Structure

```
src/__tests__/
├── setup.ts                          # Jest setup and global mocks
├── utils/
│   └── testUtils.ts                  # Test utilities and mock data
├── controller/
│   └── product.controller.test.ts    # Unit tests for product controller
├── dto/
│   └── product.dto.test.ts          # Unit tests for DTOs
├── utils/
│   └── validation.test.ts           # Unit tests for validation service
├── integration/
│   └── product.integration.test.ts  # Integration tests
└── README.md                        # This file
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Categories

### 1. Unit Tests
- **Controller Tests**: Test individual controller functions with mocked dependencies
- **DTO Tests**: Test validation rules and data transformation
- **Validation Service Tests**: Test the validation utility functions

### 2. Integration Tests
- **API Endpoint Tests**: Test complete request/response cycles
- **Database Integration**: Test with mocked database operations
- **Error Handling**: Test error scenarios end-to-end

## Test Coverage

The test suite covers:

### ✅ Controller Endpoints
- `GET /api/products` - Retrieve all products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update existing product
- `DELETE /api/products/:id` - Delete product

### ✅ Validation Scenarios
- Valid data acceptance
- Invalid data rejection
- Required field validation
- Data type validation
- Range validation (price ≥ 0, discount 0-100)
- String length validation

### ✅ Error Handling
- Database connection errors
- Validation errors
- Not found errors
- Invalid ID format errors

### ✅ Security Testing
- Input sanitization
- SQL injection prevention
- Parameter validation

## Mock Strategy

### Database Mocking
- All database operations are mocked using Jest
- No actual database connections during testing
- Predictable test data for consistent results

### Service Mocking
- ValidationService is mocked for controller tests
- Real validation logic tested in DTO tests
- Clean separation of concerns

## Test Data

### Mock Products
```typescript
const mockProduct = {
  _id: '507f1f77bcf86cd799439011',
  title: 'Test Product',
  price: 100,
  discount: 10,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};
```

### Test Scenarios
- Valid product data
- Invalid product data (missing fields, wrong types, out of range)
- Edge cases (empty strings, boundary values)
- Error conditions (database failures, network issues)

## Best Practices

### 1. Test Isolation
- Each test is independent
- Mocks are reset between tests
- No shared state between tests

### 2. Descriptive Test Names
- Clear indication of what is being tested
- Expected behavior clearly stated
- Context provided for edge cases

### 3. Arrange-Act-Assert Pattern
- **Arrange**: Set up test data and mocks
- **Act**: Execute the function being tested
- **Assert**: Verify the expected outcome

### 4. Comprehensive Coverage
- Happy path scenarios
- Error scenarios
- Edge cases
- Boundary conditions

## Dependencies

### Testing Framework
- **Jest**: Test runner and assertion library
- **Supertest**: HTTP assertion library for integration tests
- **ts-jest**: TypeScript support for Jest

### Mocking
- **Jest Mocks**: Built-in mocking capabilities
- **Manual Mocks**: Custom mock implementations for complex scenarios

## Continuous Integration

The test suite is designed to run in CI/CD pipelines:
- Fast execution (no database dependencies)
- Reliable results (deterministic test data)
- Clear failure reporting
- Coverage reporting for quality gates

