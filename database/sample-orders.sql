USE shopkartx;

INSERT INTO orders (
    order_number,
    customer_name,
    customer_email,
    customer_phone,
    subtotal,
    shipping_fee,
    discount,
    total_amount,
    payment_method,
    payment_status,
    order_status,
    shipping_address,
    city,
    state,
    postal_code,
    country,
    tracking_number,
    courier_name,
    notes
)
VALUES
(
    'SKX-10001',
    'Rahul Sharma',
    'rahul@example.com',
    '9876543210',
    29999.00,
    0.00,
    1000.00,
    28999.00,
    'RAZORPAY',
    'PAID',
    'DELIVERED',
    'Sector 15, Faridabad',
    'Faridabad',
    'Haryana',
    '121007',
    'India',
    'TRK-SKX-10001',
    'Delhivery',
    'Delivered successfully'
),
(
    'SKX-10002',
    'Priya Verma',
    'priya@example.com',
    '9876543211',
    64999.00,
    0.00,
    3000.00,
    61999.00,
    'UPI',
    'PAID',
    'SHIPPED',
    'Sector 62, Noida',
    'Noida',
    'Uttar Pradesh',
    '201309',
    'India',
    'TRK-SKX-10002',
    'Blue Dart',
    'High-value electronics order'
),
(
    'SKX-10003',
    'Aman Singh',
    'aman@example.com',
    '9876543212',
    1598.00,
    49.00,
    0.00,
    1647.00,
    'COD',
    'PENDING',
    'PROCESSING',
    'DLF Phase 3, Gurugram',
    'Gurugram',
    'Haryana',
    '122010',
    'India',
    NULL,
    NULL,
    'COD order'
),
(
    'SKX-10004',
    'Neha Gupta',
    'neha@example.com',
    '9876543213',
    4999.00,
    0.00,
    500.00,
    4499.00,
    'CARD',
    'PAID',
    'PENDING',
    'Rajouri Garden',
    'New Delhi',
    'Delhi',
    '110027',
    'India',
    NULL,
    NULL,
    'Customer requested fast delivery'
),
(
    'SKX-10005',
    'Vikash Kumar',
    'vikash@example.com',
    '9876543214',
    799.00,
    49.00,
    0.00,
    848.00,
    'COD',
    'FAILED',
    'CANCELLED',
    'Sector 21',
    'Faridabad',
    'Haryana',
    '121001',
    'India',
    NULL,
    NULL,
    'Payment failed'
);

INSERT INTO order_items (
    order_id,
    product_id,
    product_name,
    product_image,
    quantity,
    unit_price,
    total_price
)
SELECT
    o.id,
    p.id,
    p.name,
    p.image_url,
    1,
    p.price,
    p.price
FROM orders o
JOIN products p ON p.id = 1
WHERE o.order_number = 'SKX-10001';

INSERT INTO order_items (
    order_id,
    product_id,
    product_name,
    product_image,
    quantity,
    unit_price,
    total_price
)
SELECT
    o.id,
    p.id,
    p.name,
    p.image_url,
    1,
    p.price,
    p.price
FROM orders o
JOIN products p ON p.id = 2
WHERE o.order_number = 'SKX-10002';

INSERT INTO order_items (
    order_id,
    product_id,
    product_name,
    product_image,
    quantity,
    unit_price,
    total_price
)
SELECT
    o.id,
    p.id,
    p.name,
    p.image_url,
    2,
    p.price,
    p.price * 2
FROM orders o
JOIN products p ON p.id = 3
WHERE o.order_number = 'SKX-10003';

INSERT INTO order_items (
    order_id,
    product_id,
    product_name,
    product_image,
    quantity,
    unit_price,
    total_price
)
SELECT
    o.id,
    p.id,
    p.name,
    p.image_url,
    1,
    p.price,
    p.price
FROM orders o
JOIN products p ON p.id = 4
WHERE o.order_number = 'SKX-10004';

INSERT INTO order_items (
    order_id,
    product_id,
    product_name,
    product_image,
    quantity,
    unit_price,
    total_price
)
SELECT
    o.id,
    p.id,
    p.name,
    p.image_url,
    1,
    p.price,
    p.price
FROM orders o
JOIN products p ON p.id = 3
WHERE o.order_number = 'SKX-10005';
