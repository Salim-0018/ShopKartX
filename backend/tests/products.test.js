const request = require("supertest");

jest.mock("../src/models/productModel", () => ({
  getProducts: jest.fn(),
  getProductById: jest.fn(),
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
}));

const productModel = require("../src/models/productModel");
const app = require("../src/server");

describe("ShopKartX Product API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/v1/products", () => {
    test("should return product list successfully", async () => {
      productModel.getProducts.mockResolvedValue({
        products: [
          {
            id: 1,
            name: "Test Product",
            slug: "test-product",
            price: 999,
            stock: 10,
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      });

      const response = await request(app)
        .get("/api/v1/products");

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].name).toBe("Test Product");

      expect(productModel.getProducts).toHaveBeenCalledTimes(1);
    });
  });

  describe("GET /api/v1/products/:id", () => {
    test("should return a product by ID", async () => {
      productModel.getProductById.mockResolvedValue({
        id: 1,
        name: "Test Product",
        slug: "test-product",
        price: 999,
        stock: 10,
      });

      const response = await request(app)
        .get("/api/v1/products/1");

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.product.id).toBe(1);
      expect(response.body.product.name).toBe("Test Product");

      expect(productModel.getProductById)
        .toHaveBeenCalledWith("1");
    });

    test("should return 404 when product does not exist", async () => {
      productModel.getProductById.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/v1/products/99999");

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Product not found");
    });
  });

  describe("POST /api/v1/products", () => {
    test("should reject request when required fields are missing", async () => {
      const response = await request(app)
        .post("/api/v1/products")
        .send({
          name: "Test Product",
          price: 999,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "category_id, name, slug and price are required"
      );

      expect(productModel.createProduct).not.toHaveBeenCalled();
    });

    test("should create a product successfully", async () => {
      productModel.createProduct.mockResolvedValue({
        id: 2,
        category_id: 1,
        name: "New Product",
        slug: "new-product",
        price: 1499,
        stock: 20,
      });

      const productData = {
        category_id: 1,
        name: "New Product",
        slug: "new-product",
        price: 1499,
        stock: 20,
      };

      const response = await request(app)
        .post("/api/v1/products")
        .send(productData);

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        "Product created successfully"
      );
      expect(response.body.product.id).toBe(2);
      expect(response.body.product.name).toBe("New Product");

      expect(productModel.createProduct)
        .toHaveBeenCalledWith(productData);
    });
  });
});
