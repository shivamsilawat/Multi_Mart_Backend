
import User from "../models/User.js";

// GET ALL SELLERS
export const getAllSellers = async (req, res) => {
  try {
    const sellers = await User.find({ role: "seller" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Sellers fetched successfully",
      totalSellers: sellers.length,
      sellers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch sellers",
    });
  }
};

// APPROVE OR REJECT SELLER
export const updateSellerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { sellerId } = req.params;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be approved or rejected",
      });
    }

    const seller = await User.findOne({
      _id: sellerId,
      role: "seller",
    });

    if (!seller) {
      return res.status(404).json({
        message: "Seller not found",
      });
    }

    seller.sellerStatus = status;
    await seller.save();

    res.status(200).json({
      message: `Seller ${status} successfully`,
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        sellerStatus: seller.sellerStatus,
        sellerProfile: seller.sellerProfile,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to update seller status",
    });
  }
};
