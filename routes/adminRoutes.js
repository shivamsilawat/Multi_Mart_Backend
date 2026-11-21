
import express from "express";
import {
  getAllSellers,
    updateSellerStatus,
} from "../controllers/adminController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin dashboard
router.get("/dashboard", protect, authorize("admin"), (req, res) => {
  res.status(200).json({
    message: "Welcome to the MultiMart Admin Dashboard!",
    admin: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

// Get all registered sellers
router.get("/sellers", protect, authorize("admin"), getAllSellers);
// Approve or reject seller
router.patch(
  "/sellers/:sellerId/status",
  protect,
  authorize("admin"),
  updateSellerStatus
);

export default router;
