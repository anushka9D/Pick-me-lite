const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
},
  description: { 
    type: String 
},
  price: { 
    type: Number, 
    required: true 
},
  image: { 
    type: String,
    required: true
},
category: {
    type: String,
    required: true
},
  restaurant: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
},
  isAvailable: { 
    type: String, 
    default: true 
},
  createdAt: { 
    type: Date, 
    default: Date.now 
}
});

module.exports = mongoose.model('MenuItem', menuItemSchema);