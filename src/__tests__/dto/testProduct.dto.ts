// Test DTOs without decorators for testing
export class TestCreateProductDto {
  title: string;
  price: number;
  discount?: number;
}

export class TestUpdateProductDto {
  title?: string;
  price?: number;
  discount?: number;
}
