
import express from "express";

import {
  getAllProducts,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/sellerProductController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Only approved sellers can manage products
const approvedSellerOnly = (req, res, next) => {
  if (req.user.sellerStatus !== "approved") {
    return res.status(403).json({
      message: "Your seller account is not approved yet.",
    });
  }

  next();
};

// PUBLIC ROUTE - ALL CUSTOMER PRODUCTS
router.get("/all", getAllProducts);

router.use(protect, authorize("seller"), approvedSellerOnly);

router.get("/", getMyProducts);
router.post("/", createProduct);
router.put("/:productId", updateProduct);
router.delete("/:productId", deleteProduct);

export default router;
