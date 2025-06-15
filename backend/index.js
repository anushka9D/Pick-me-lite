const express = require('express');
const dotenv = require('dotenv').config();
const dbConnect = require('./src/config/dbConnect');
const app = express();
const cors = require('cors');
const path = require('path');
const authRoutes = require('./src/routes/authRoutes');
const menuItem = require('./src/routes/menuItemRoutes');
const restaurants = require('./src/routes/restaurantRoutes');

app.use(cors());

//Middleware
app.use(express.json());

//Database Connection
dbConnect();

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/menuItem', menuItem);
app.use('/api/restaurants', restaurants);

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Start server 
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 