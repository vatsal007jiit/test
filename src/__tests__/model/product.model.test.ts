import ProductModel from '../../model/product.model';

describe('Product Model', () => {
  it('should export ProductModel', () => {
    // Assert
    expect(ProductModel).toBeDefined();
    expect(typeof ProductModel).toBe('function');
  });

  it('should have model name', () => {
    // Assert
    expect(ProductModel.modelName).toBe('Product');
  });

  it('should have schema defined', () => {
    // Assert
    expect(ProductModel.schema).toBeDefined();
  });

  it('should have schema paths for required fields', () => {
    // Assert
    const schema = ProductModel.schema;
    expect(schema.paths.title).toBeDefined();
    expect(schema.paths.price).toBeDefined();
    expect(schema.paths.discount).toBeDefined();
  });

  it('should have correct field types', () => {
    // Assert
    const schema = ProductModel.schema;
    expect(schema.paths.title.instance).toBe('String');
    expect(schema.paths.price.instance).toBe('Number');
    expect(schema.paths.discount.instance).toBe('Number');
  });

  it('should have required fields configured', () => {
    // Assert
    const schema = ProductModel.schema;
    expect(schema.paths.title.isRequired).toBe(true);
    expect(schema.paths.price.isRequired).toBe(true);
    expect(schema.paths.discount.isRequired).toBeUndefined(); // Optional fields don't have isRequired property
  });

  it('should have default value for discount', () => {
    // Assert
    const schema = ProductModel.schema;
    expect(schema.paths.discount.options.default).toBe(0);
  });

  it('should have timestamps enabled', () => {
    // Assert
    const schema = ProductModel.schema;
    expect(schema.paths.createdAt).toBeDefined();
    expect(schema.paths.updatedAt).toBeDefined();
  });

  it('should have title field options', () => {
    // Assert
    const schema = ProductModel.schema;
    const titlePath = schema.paths.title;
    expect(titlePath.options.trim).toBe(true);
    expect(titlePath.options.lowercase).toBe(true);
  });
});