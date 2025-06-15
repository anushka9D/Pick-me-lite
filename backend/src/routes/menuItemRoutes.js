const express = require('express');
const router = express.Router();
const verifyToken = require("../middilewares/authMiddileware");
const authorizeRoles = require("../middilewares/roleMiddileware");
const { createMenuItem, getRestaurantMenuItems, deleteMenuItem, updateMenuItemAvailability, updateMenuItem, getPopularMenuItems, upload } = require('../controllers/menuItemController');

router.post("/register", verifyToken, authorizeRoles("restaurant"), upload.single('image'), createMenuItem);
router.get("/restaurant", verifyToken, authorizeRoles("restaurant"), getRestaurantMenuItems);
router.delete("/:itemId", verifyToken, authorizeRoles("restaurant"), deleteMenuItem);
router.patch("/:itemId/availability", verifyToken, authorizeRoles("restaurant"), updateMenuItemAvailability);
router.put("/:itemId", verifyToken, authorizeRoles("restaurant"), upload.single('image'), updateMenuItem);
router.get("/popular", verifyToken, getPopularMenuItems);

module.exports = router;