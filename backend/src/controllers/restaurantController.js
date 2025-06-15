const Restaurant = require("../models/restaurantModel");
const bcrypt = require("bcryptjs");
const Login = require("../models/loginModel");
const MenuItem = require("../models/menuItemModel");
const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Configure Twilio client
const twilioClient = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.createRestaurant = async (req, res) => {

    const { name, location, contact, email, description, password } = req.body;

    if (!name || !location || !contact || !email || !description || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingRestaurant = await Restaurant.findOne({ email });
    if (existingRestaurant) {
        return res.status(400).json({ error: "Restaurant already exists" });
    }

    const newRestaurant = new Restaurant({ 
        name, 
        location, 
        contact: Number(contact),
        email, 
        description,
        password: hashedPassword,
        role: "restaurant"
     });

    const login = new Login({ email, password: hashedPassword, role: "restaurant" });


    try {
        await newRestaurant.save();
        await login.save();

        // Send email notification
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Congratulations! Restaurant Profile Created Successfully',
        html: `
          <h1>Welcome to Our Platform, ${name}!</h1>
          <p>Your restaurant profile has been successfully created.</p>
          <p><strong>Details:</strong></p>
          <ul>
            <li>Location: ${location}</li>
            <li>Contact: ${contact}</li>
            <li>Email: ${email}</li>
          </ul>
          <p>You can now log in and start managing your profile.</p>
        `
      };
  
      try {
        await transporter.sendMail(mailOptions);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
  
      // Send SMS notification
      const smsBody = `Hi ${name}, your restaurant profile was successfully created. 
                      Login email: ${email}. Contact us if you need assistance.`;
  
      try {
        await twilioClient.messages.create({
            body: smsBody,
            from: process.env.TWILIO_PHONE,
            to: `+94${contact.startsWith('0') ? contact.slice(1) : contact}`
          });
      } catch (smsError) {
        console.error('SMS sending failed:', smsError);
      }

        res.status(201).json("Restaurant created successfully");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        res.status(200).json(restaurants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getRestaurantsById = async (req, res) => {
    try {
        const id = req.user.id;
        const restaurant = await Restaurant.findById(id);
        res.status(200).json(restaurant);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateRestaurantById = async (req, res) => {
    try {
        const { _id, name, location, contact, email, description, password,isAvailable, previousEmail } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

            // Update password in Login model as well
            await Login.findOneAndUpdate(
                { email: previousEmail }, // filter
                { email, password: hashedPassword }, // update
                { new: true } // options
            );

        const updatedRestaurant = await Restaurant.findByIdAndUpdate( _id,
            { 
                name, 
                location, 
                contact: Number(contact),
                email, 
                description,
                password: hashedPassword,
                isAvailable
            },
            { new: true }
        );

        if (!updatedRestaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        res.status(200).json(updatedRestaurant);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteRestaurantById = async (req, res) => {
    try {
        const id  = req.user.id;

        // Find the restaurant by ID
        const restaurant = await Restaurant.findById(id);
        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        // Delete the corresponding login entry
        await Login.findOneAndDelete({ email: restaurant.email });

        // Delete all menu items associated with this restaurant
        await MenuItem.deleteMany({ restaurant: id });

        // Delete the restaurant
        await Restaurant.findByIdAndDelete(id);

        res.status(200).json({ message: "Restaurant deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

