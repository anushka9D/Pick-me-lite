const multer = require('multer');
const path = require('path');
const fs = require('fs');
const MenuItem = require("../models/menuItemModel");

// Setup Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

exports.upload = upload;

exports.createMenuItem = async (req, res) => {
  try {
    const id = req.user.id;
    const { name, description, price, category } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: "All fields (name, description, price, category) are required" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }
    if (isNaN(Number(price))) {
      return res.status(400).json({ message: "Price must be a valid number" });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    const newMenuItem = new MenuItem({
      name,
      description,
      price: Number(price),
      image: imagePath,
      category,
      restaurant: id,
      isAvailable: 'true'
    });

    await newMenuItem.save();
    res.status(201).json("MenuItem created successfully");
  } catch (error) {
    console.error('Error creating menu item:', error); // Log the error
    res.status(500).json({ message: "MenuItem creation failed", error: error.message });
  }
};

// Get menu items for the logged-in restaurant
exports.getRestaurantMenuItems = async (req, res) => {
  try {
    const restaurantId = req.user.id;
    
    // Find all menu items belonging to this restaurant, sort by newest first
    const menuItems = await MenuItem.find({ restaurant: restaurantId })
      .sort({ createdAt: -1 });
    
    res.status(200).json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ message: "Failed to fetch menu items", error: error.message });
  }
};

// Delete a menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const restaurantId = req.user.id;
    
    // Find the menu item and ensure it belongs to this restaurant
    const menuItem = await MenuItem.findOne({ _id: itemId, restaurant: restaurantId });
    
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found or you don't have permission to delete it" });
    }
    
    // If there's an image file, delete it
    if (menuItem.image) {
      const imagePath = path.join(__dirname, '..', menuItem.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete the menu item
    await MenuItem.findByIdAndDelete(itemId);
    
    res.status(200).json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ message: "Failed to delete menu item", error: error.message });
  }
};

// Update a menu item's availability
exports.updateMenuItemAvailability = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { isAvailable } = req.body;
    const restaurantId = req.user.id;
    
    // Find and update the menu item
    const menuItem = await MenuItem.findOneAndUpdate(
      { _id: itemId, restaurant: restaurantId },
      { isAvailable },
      { new: true }
    );
    
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found or you don't have permission to update it" });
    }
    
    res.status(200).json({ message: "Menu item updated successfully", menuItem });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ message: "Failed to update menu item", error: error.message });
  }
};

// Update a menu item completely
exports.updateMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { name, description, price, category, isAvailable } = req.body;
    const restaurantId = req.user.id;
    
    // Find the menu item to update
    const menuItem = await MenuItem.findOne({ _id: itemId, restaurant: restaurantId });
    
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found or you don't have permission to update it" });
    }
    
    // Prepare update object
    const updateData = {
      name: name || menuItem.name,
      description: description || menuItem.description,
      price: price ? Number(price) : menuItem.price,
      category: category || menuItem.category,
      isAvailable: isAvailable !== undefined ? isAvailable : menuItem.isAvailable
    };
    
    // Handle image update if a new file was uploaded
    if (req.file) {
      // Delete old image if it exists
      if (menuItem.image) {
        const oldImagePath = path.join(__dirname, '..', menuItem.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      // Set new image path
      updateData.image = `/uploads/${req.file.filename}`;
    }
    
    // Update the menu item
    const updatedMenuItem = await MenuItem.findByIdAndUpdate(
      itemId,
      updateData,
      { new: true }
    );
    
    res.status(200).json({ 
      message: "Menu item updated successfully", 
      menuItem: updatedMenuItem 
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ message: "Failed to update menu item", error: error.message });
  }
};

exports.getPopularMenuItems = async (req, res) => {
  try {
    // Find all available menu items, limit to 8 items for "popular" section
    // Sort by newest first (you can change this logic if you have a rating system)
    const menuItems = await MenuItem.find({ isAvailable: 'true' })
      .sort({ createdAt: -1 })
      .limit(8);
    
    res.status(200).json(menuItems);
  } catch (error) {
    console.error('Error fetching popular menu items:', error);
    res.status(500).json({ message: "Failed to fetch popular menu items", error: error.message });
  }
};