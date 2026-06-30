const mongoose = require('mongoose');
const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true, enum: ['Burgers','Pizza','Sushi','Salads','Desserts','Drinks'] },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('MenuItem', menuItemSchema);
