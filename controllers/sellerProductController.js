
import Product from "../models/Product.js";


// GET PRODUCTS OF LOGGED-IN SELLER
export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({
      seller: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch products",
    });
  }
};

// ADD PRODUCT
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      originalPrice,
      stock,
      description,
      image,
    } = req.body;

    if (!name || !category || price === undefined || stock === undefined) {
      return res.status(400).json({
        message: "Please provide all required product fields",
      });
    }

    const product = await Product.create({
      name,
      category,
      price,
      originalPrice,
      stock,
      description,
      image,
      seller: req.user._id,
      storeName: req.user.sellerProfile?.storeName,
    });

    res.status(201).json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to add product",
    });
  }
};

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.productId,
      seller: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const allowedFields = [
      "name",
      "category",
      "price",
      "originalPrice",
      "stock",
      "description",
      "image",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to update product",
    });
  }
};

// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.productId,
      seller: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to delete product",
    });
  }
};


// GET ALL ACTIVE PRODUCTS FOR CUSTOMERS
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      stock: { $gt: 0 },
    })
      .populate("seller", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    console.error("Get all products error:", error);

    res.status(500).json({
      message: "Unable to fetch products",
    });
  }
};

