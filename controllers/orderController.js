
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// @desc Create a new order
// @route POST /api/orders
// @access Customer
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    // Validate cart
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty.",
      });
    }

    // Validate shipping address
    const requiredFields = [
      "name", "email", "phone", "street",
      "city", "state", "pincode",
    ];

    if (
      !shippingAddress ||
      requiredFields.some(
        (field) => !shippingAddress[field]?.toString().trim()
      )
    ) {
      return res.status(400).json({
        message: "Please provide a complete shipping address.",
      });
    }

    // Validate payment method
    if (!["COD", "ONLINE"].includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method.",
      });
    }

    // Validate products and quantities
    const requestedItems = new Map();

    for (const item of items) {
      if (
        !item.productId ||
        !mongoose.isValidObjectId(item.productId) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          message: "Invalid product or quantity.",
        });
      }

      const productId = item.productId.toString();

      requestedItems.set(
        productId,
        (requestedItems.get(productId) || 0) + item.quantity
      );
    }

    const productIds = [...requestedItems.keys()];

    let createdOrder;

    // Start transaction
    await session.withTransaction(async () => {

      // Fetch active products
      const products = await Product.find({
        _id: { $in: productIds },
        isActive: true,
      }).session(session);

      if (products.length !== productIds.length) {
        const error = new Error(
          "One or more products are unavailable."
        );
        error.statusCode = 400;
        throw error;
      }

      const orderItems = [];
      let subtotal = 0;

      // Deduct stock safely
      for (const product of products) {
        const quantity = requestedItems.get(
          product._id.toString()
        );

        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: product._id,
            isActive: true,
            stock: { $gte: quantity },
          },
          {
            $inc: { stock: -quantity },
          },
          {
            new: true,
            session,
          }
        );

        if (!updatedProduct) {
          const error = new Error(
            `${product.name} has insufficient stock.`
          );
          error.statusCode = 400;
          throw error;
        }

        // Build order item using database values
        orderItems.push({
          product: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity,
          seller: product.seller,
          storeName: product.storeName,
        });

        subtotal += product.price * quantity;
      }

      // Calculate total
      const shipping = 0;
      const total = subtotal + shipping;

      // Create order inside transaction
      const order = new Order({
        user: req.user._id,
        items: orderItems,
        shippingAddress,
        paymentMethod,
        paymentStatus: "Pending",
        subtotal,
        shipping,
        total,
        orderStatus: "Order Placed",
      });

      await order.save({ session });

      createdOrder = order;
    });

    // Return successful response
    return res.status(201).json({
      message: "Order placed successfully.",
      order: createdOrder,
    });

  } catch (error) {
    console.error("Create order error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.statusCode
        ? error.message
        : "Failed to place order.",
    });

  } finally {
    await session.endSession();
  }
};

// @desc Get logged-in customer's orders
// @route GET /api/orders/myorders
// @access Customer
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .populate("items.product", "name image")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      orders,
    });
  } catch (error) {
    console.error("Get customer orders error:", error);

    return res.status(500).json({
      message: "Failed to fetch orders.",
    });
  }
};
