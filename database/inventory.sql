USE shopkartx;

-- ============================================================
-- ShopKartX Inventory Management
-- ============================================================

CREATE TABLE IF NOT EXISTS inventory_movements (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,

    product_id INT NOT NULL,

    movement_type ENUM(
        'IN',
        'OUT',
        'ADJUSTMENT',
        'RETURN',
        'DAMAGE',
        'RESERVED',
        'RELEASED'
    ) NOT NULL DEFAULT 'ADJUSTMENT',

    quantity INT NOT NULL,

    previous_stock INT NOT NULL,
    new_stock INT NOT NULL,

    reference_type VARCHAR(50) DEFAULT NULL,
    reference_id VARCHAR(100) DEFAULT NULL,

    reason VARCHAR(255) DEFAULT NULL,
    notes TEXT DEFAULT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_inventory_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    INDEX idx_inventory_product (product_id),
    INDEX idx_inventory_movement_type (movement_type),
    INDEX idx_inventory_created_at (created_at),
    INDEX idx_inventory_reference (reference_type, reference_id)
);

-- ============================================================
-- Initial inventory history
-- Creates an initial ADJUSTMENT record for existing products
-- ============================================================

INSERT INTO inventory_movements (
    product_id,
    movement_type,
    quantity,
    previous_stock,
    new_stock,
    reference_type,
    reason
)
SELECT
    p.id,
    'ADJUSTMENT',
    p.stock,
    0,
    p.stock,
    'INITIAL',
    'Initial inventory setup'
FROM products p
WHERE NOT EXISTS (
    SELECT 1
    FROM inventory_movements im
    WHERE im.product_id = p.id
      AND im.reference_type = 'INITIAL'
);

-- ============================================================
-- Inventory summary view
-- ============================================================

CREATE OR REPLACE VIEW inventory_summary AS
SELECT
    p.id AS product_id,
    p.name AS product_name,
    p.image_url,
    p.price,
    p.stock AS current_stock,

    CASE
        WHEN p.stock = 0 THEN 'OUT_OF_STOCK'
        WHEN p.stock <= 10 THEN 'LOW_STOCK'
        ELSE 'IN_STOCK'
    END AS stock_status,

    COALESCE(
        (
            SELECT SUM(
                CASE
                    WHEN im.movement_type IN ('IN', 'RETURN', 'RELEASED')
                    THEN im.quantity

                    WHEN im.movement_type IN ('OUT', 'DAMAGE', 'RESERVED')
                    THEN -im.quantity

                    ELSE 0
                END
            )
            FROM inventory_movements im
            WHERE im.product_id = p.id
        ),
        0
    ) AS calculated_movement,

    (
        SELECT MAX(im.created_at)
        FROM inventory_movements im
        WHERE im.product_id = p.id
    ) AS last_movement_at

FROM products p
WHERE p.is_active = 1;
