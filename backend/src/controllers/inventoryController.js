const inventoryModel = require("../models/inventoryModel");

async function getInventory(req, res, next) {
  try {
    const {
      search = "",
      stock_status: stockStatus = "",
      limit = 100,
      offset = 0,
    } = req.query;

    const inventory = await inventoryModel.getInventory({
      search,
      stockStatus,
      limit,
      offset,
    });

    res.status(200).json({
      success: true,
      count: inventory.length,
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
}

async function getStats(req, res, next) {
  try {
    const stats = await inventoryModel.getInventoryStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

async function getProduct(req, res, next) {
  try {
    const { id } = req.params;

    const product = await inventoryModel.getInventoryProduct(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

async function getMovements(req, res, next) {
  try {
    const { product_id: productId } = req.query;

    const movements =
      await inventoryModel.getInventoryMovements(productId || null);

    res.status(200).json({
      success: true,
      count: movements.length,
      data: movements,
    });
  } catch (error) {
    next(error);
  }
}

async function updateStock(req, res, next) {
  try {
    const { id } = req.params;

    const {
      quantity,
      movement_type: movementType,
      reason = null,
      notes = null,
      reference_type: referenceType = null,
      reference_id: referenceId = null,
    } = req.body;

    if (!quantity) {
      return res.status(400).json({
        success: false,
        message: "Quantity is required",
      });
    }

    const allowedTypes = [
      "IN",
      "OUT",
      "RETURN",
      "DAMAGE",
      "RESERVED",
      "RELEASED",
    ];

    if (!movementType || !allowedTypes.includes(movementType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid movement_type. Allowed values: ${allowedTypes.join(
          ", "
        )}`,
      });
    }

    const result = await inventoryModel.updateStock(
      id,
      quantity,
      movementType,
      reason,
      notes,
      referenceType,
      referenceId
    );

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      data: result,
    });
  } catch (error) {
    if (
      error.message === "Product not found" ||
      error.message.startsWith("Insufficient stock") ||
      error.message === "Quantity must be a positive integer" ||
      error.message === "Invalid inventory movement type"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
}

module.exports = {
  getInventory,
  getStats,
  getProduct,
  getMovements,
  updateStock,
};
