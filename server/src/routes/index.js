const express = require("express");
const authRoutes = require("./authRoutes");
const petRoutes = require("./petRoutes");
const cartRoutes = require("./cartRoutes");
const favoriteRoutes = require("./favoriteRoutes");
const orderRoutes = require("./orderRoutes");
const userRoutes = require("./userRoutes");
const conversationRoutes = require("./conversationRoutes");
const notificationRoutes = require("./notificationRoutes");
const accountRoutes = require("./accountRoutes");
const supportRoutes = require("./supportRoutes");
const adminRoutes = require("./adminRoutes");
const sellerRoutes = require("./sellerRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/pets", petRoutes);
router.use("/cart", cartRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/orders", orderRoutes);
router.use("/users", userRoutes);
router.use("/conversations", conversationRoutes);
router.use("/notifications", notificationRoutes);
router.use("/account", accountRoutes);
router.use("/support", supportRoutes);
router.use("/admin", adminRoutes);
router.use("/sellers", sellerRoutes);

module.exports = router;
