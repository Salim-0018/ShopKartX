CREATE DATABASE IF NOT EXISTS shopkartx;

USE shopkartx;

-- ============================================================
-- CUSTOMERS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS customers (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,

    name VARCHAR(150) NOT NULL,
    email VARCHAR(190) NOT NULL,
    phone VARCHAR(30) NULL,

    password_hash VARCHAR(255) NULL,

    avatar_url VARCHAR(500) NULL,

    address_line1 VARCHAR(255) NULL,
    address_line2 VARCHAR(255) NULL,
    city VARCHAR(100) NULL,
    state VARCHAR(100) NULL,
    postal_code VARCHAR(20) NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',

    status ENUM('ACTIVE', 'INACTIVE', 'BLOCKED')
        NOT NULL DEFAULT 'ACTIVE',

    total_orders INT UNSIGNED NOT NULL DEFAULT 0,
    total_spent DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    last_order_at DATETIME NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uk_customers_email (email),

    KEY idx_customers_name (name),
    KEY idx_customers_phone (phone),
    KEY idx_customers_status (status),
    KEY idx_customers_created_at (created_at)
);


-- ============================================================
-- SAMPLE CUSTOMERS
-- ============================================================

INSERT INTO customers (
    name,
    email,
    phone,
    avatar_url,
    city,
    state,
    postal_code,
    country,
    status
)
VALUES
(
    'Rahul Sharma',
    'rahul.sharma@example.com',
    '+91 9876543210',
    'https://i.pravatar.cc/150?img=12',
    'New Delhi',
    'Delhi',
    '110001',
    'India',
    'ACTIVE'
),
(
    'Priya Verma',
    'priya.verma@example.com',
    '+91 9876543211',
    'https://i.pravatar.cc/150?img=47',
    'Noida',
    'Uttar Pradesh',
    '201301',
    'India',
    'ACTIVE'
),
(
    'Aman Singh',
    'aman.singh@example.com',
    '+91 9876543212',
    'https://i.pravatar.cc/150?img=11',
    'Gurugram',
    'Haryana',
    '122001',
    'India',
    'ACTIVE'
),
(
    'Neha Gupta',
    'neha.gupta@example.com',
    '+91 9876543213',
    'https://i.pravatar.cc/150?img=32',
    'Faridabad',
    'Haryana',
    '121001',
    'India',
    'ACTIVE'
),
(
    'Vikash Kumar',
    'vikash.kumar@example.com',
    '+91 9876543214',
    'https://i.pravatar.cc/150?img=68',
    'Ghaziabad',
    'Uttar Pradesh',
    '201001',
    'India',
    'INACTIVE'
)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    phone = VALUES(phone),
    avatar_url = VALUES(avatar_url),
    city = VALUES(city),
    state = VALUES(state),
    postal_code = VALUES(postal_code),
    status = VALUES(status);


-- ============================================================
-- SYNC CUSTOMER ORDER SUMMARY
-- ============================================================

UPDATE customers c
LEFT JOIN (
    SELECT
        customer_email,
        COUNT(*) AS order_count,
        COALESCE(SUM(total_amount), 0) AS spent,
        MAX(created_at) AS last_order
    FROM orders
    GROUP BY customer_email
) o
    ON o.customer_email = c.email
SET
    c.total_orders = COALESCE(o.order_count, 0),
    c.total_spent = COALESCE(o.spent, 0),
    c.last_order_at = o.last_order;
