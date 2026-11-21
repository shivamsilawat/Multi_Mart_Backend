
import express from "express";

import {
  createOrder,
  getMyOrders,
} from "../controllers/orderController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Customer places an order
router.post(
  "/",
  protect,
  authorize("customer"),
  createOrder
);

// Customer views their orders
router.get(
  "/myorders",
  protect,
  authorize("customer"),
  getMyOrders
);

export default router;
