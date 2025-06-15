const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
},
  location: { 
    type: String, 
    required: true 
},
  contact: { 
    type: Number, 
    required: true 
},
email: {
    type: String,
    required: true,
    unique: true
},
password: {
    type: String,
    required: true,
},
role: {
    type: String,
    required: true,
    default: "resturant",
},
description: { 
    type: String, 
    required: true 
},
  isAvailable: { 
    type: String, 
    default: "true" 
},
  createdAt: { 
    type: Date, 
    default: Date.now 
}
});

module.exports = mongoose.model('Restaurant', restaurantSchema);