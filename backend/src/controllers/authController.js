const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Login = require("../models/loginModel");
const Restaurant = require("../models/restaurantModel");

exports.login = async (req, res) => {
    
    try {
        const { email, password } = req.body;
        const login = await Login.findOne({ email });
        if (!login) {
            return res.status(404).json({ error: "Invalid email or password" });
        }
        const isPasswordValid = await bcrypt.compare(password, login.password);
        if (!isPasswordValid) {
            return res.status(404).json({ error: "Invalid email or password" });
        }

        let userData;
        if (login.role === "restaurant") {
            userData = await Restaurant.findOne({ email });
            if (!userData) {
                return res.status(404).json({ error: "User not found" });
            }
        } else if (login.role === "user") {
            userData = await Login.findOne({ email });
            if (!userData) {
                return res.status(404).json({ error: "User not found" });
            }
        } else if (login.role === "admin") {
            userData = await Login.findOne({ email });
            if (!userData) {
                return res.status(404).json({ error: "User not found" });
            }
        }else if (login.role === "dilevery") {
            userData = await Login.findOne({ email });
            if (!userData) {
                return res.status(404).json({ error: "User not found" });
            }
        }
        else {
            return res.status(400).json({ error: "Invalid user role" });
        }

        const token = jwt.sign({ id: userData._id, role: login.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ token });


    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};