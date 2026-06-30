const router = require('express').Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const { items, totalAmount, deliveryFee, address, payment } = req.body;
    const order = await Order.create({ user: req.user.id, items, totalAmount, deliveryFee, address, payment });
    await User.findByIdAndUpdate(req.user.id, { hasOrdered: true });
    res.status(201).json(order);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/my-orders', auth, async (req, res) => {
  try { res.json(await Order.find({ user: req.user.id }).sort({ createdAt: -1 })); }
  catch { res.status(500).json({ message: 'Server error' }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!['pending','confirmed'].includes(order.status))
      return res.status(400).json({ message: 'Cannot cancel at this stage' });
    order.status = 'cancelled';
    order.cancelledBy = 'user';
    await order.save();
    res.json(order);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
