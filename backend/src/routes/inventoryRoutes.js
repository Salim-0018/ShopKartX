const express = require("express");
const controller = require("../controllers/inventoryController");

const router = express.Router();

// Inventory list
router.get("/", controller.getInventory);

// Inventory statistics
router.get("/stats", controller.getStats);

// Inventory movement history
router.get("/movements", controller.getMovements);

// Single product inventory
router.get("/:id", controller.getProduct);

// Increase / decrease / adjust stock
router.patch("/:id/stock", controller.updateStock);

module.exports = router;
