const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }, name: String, price: Number, quantity: { type: Number, default: 1 }, image: String }],
  totalAmount: { type: Number, required: true },
  deliveryFee: { type: Number, default: 5 },
  status: { type: String, enum: ['pending','confirmed','preparing','out_for_delivery','delivered','cancelled'], default: 'pending' },
  cancelledBy: { type: String, enum: ['user','admin',null], default: null },
  address: { street: String, city: String, zipCode: String, fullAddress: String },
  payment: { method: { type: String, enum: ['mobile_money','card','cash'] }, provider: String, phone: String, status: { type: String, enum: ['pending','paid','failed'], default: 'pending' } },
  estimatedDelivery: { type: String, default: '30-45 mins' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Order', orderSchema);
