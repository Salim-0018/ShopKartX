CREATE DATABASE IF NOT EXISTS shopkartx;

USE shopkartx;

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    stock INT NOT NULL DEFAULT 0,
    brand VARCHAR(100),
    image_url VARCHAR(500),
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_category_id (category_id),
    INDEX idx_price (price),
    INDEX idx_stock (stock),
    INDEX idx_is_active (is_active),

    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

INSERT IGNORE INTO categories (name, slug) VALUES
('Electronics', 'electronics'),
('Fashion', 'fashion'),
('Home & Kitchen', 'home-kitchen'),
('Beauty', 'beauty'),
('Grocery', 'grocery');

INSERT IGNORE INTO products
(category_id, name, slug, description, price, original_price, stock, brand, image_url, rating, review_count)
VALUES
(
    1,
    'Smartphone Pro X',
    'smartphone-pro-x',
    'High-performance smartphone with modern features.',
    29999.00,
    34999.00,
    50,
    'ShopKartX',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
    4.50,
    120
),
(
    1,
    'UltraBook 14',
    'ultrabook-14',
    'Lightweight laptop for work and development.',
    64999.00,
    74999.00,
    25,
    'ShopKartX',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853',
    4.60,
    85
),
(
    2,
    'Classic Cotton T-Shirt',
    'classic-cotton-tshirt',
    'Comfortable premium cotton T-shirt.',
    799.00,
    1299.00,
    100,
    'ShopKartX',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
    4.30,
    210
),
(
    3,
    'Air Fryer 5L',
    'air-fryer-5l',
    'Digital air fryer with multiple cooking modes.',
    4999.00,
    6999.00,
    30,
    'ShopKartX',
    'https://images.unsplash.com/photo-1585515320310-259814833e62',
    4.40,
    75
);
