const router = require('express').Router();
const User = require('../models/User');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { adminAuth } = require('../middleware/auth');

router.get('/stats', adminAuth, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    const now = new Date();
    const periods = {
      week: new Date(now - 7*24*60*60*1000),
      month: new Date(now - 30*24*60*60*1000),
      '3months': new Date(now - 90*24*60*60*1000),
      '6months': new Date(now - 180*24*60*60*1000),
      year: new Date(now - 365*24*60*60*1000),
    };
    const since = periods[period] || periods.week;
    const fmt = period === 'week' ? '%Y-%m-%d' : period === 'month' ? '%Y-%m-%d' : period === '3months' ? '%Y-%m' : period === '6months' ? '%Y-%m' : '%Y-%m';

    const [totalUsers, totalOrders, totalMenuItems, pendingOrders, revenue, periodOrders, periodRevenue, categoryStats, dailyRevenue] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Order.countDocuments(),
      MenuItem.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.countDocuments({ createdAt: { $gte: since } }),
      Order.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.aggregate([{ $unwind: '$items' }, { $group: { _id: '$items.name', count: { $sum: '$items.quantity' } } }, { $sort: { count: -1 } }, { $limit: 6 }]),
      Order.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: { $dateToString: { format: fmt, date: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } }, { $sort: { _id: 1 } }])
    ]);
    res.json({ totalUsers, totalOrders, totalMenuItems, pendingOrders, totalRevenue: revenue[0]?.total || 0, periodOrders, periodRevenue: periodRevenue[0]?.total || 0, categoryStats, dailyRevenue });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/users', adminAuth, async (req, res) => {
  try { res.json(await User.find().select('-password')); }
  catch { res.status(500).json({ message: 'Server error' }); }
});

router.get('/orders', adminAuth, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;
    res.json(await Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 }));
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.put('/orders/:id', adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status === 'cancelled' && order.cancelledBy === 'user')
      return res.status(400).json({ message: 'Cannot change user-cancelled orders' });
    order.status = req.body.status;
    order.updatedAt = Date.now();
    await order.save();
    res.json(order);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/users/:id', adminAuth, async (req, res) => {
  try { await User.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
