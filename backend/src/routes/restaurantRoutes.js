const express = require('express');
const router = express.Router();
const verifyToken = require ("../middilewares/authMiddileware");
const  authorizeRoles  = require("../middilewares/roleMiddileware");
const { createRestaurant, getRestaurants, getRestaurantsById, updateRestaurantById, deleteRestaurantById } = require('../controllers/restaurantController');

router.post("/register", createRestaurant);
router.get("/all", verifyToken, authorizeRoles("admin"), getRestaurants);
router.get("/single", verifyToken, authorizeRoles("restaurant"), getRestaurantsById);
router.put("/update", verifyToken, authorizeRoles("restaurant"), updateRestaurantById);
router.delete("/delete", verifyToken, authorizeRoles("restaurant"), deleteRestaurantById);

module.exports = router;