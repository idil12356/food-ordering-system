const router = require('express').Router();
const MenuItem = require('../models/MenuItem');
const { adminAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5*1024*1024 } });

router.get('/', async (req, res) => {
  try {
    const filter = { available: true };
    if (req.query.category && req.query.category !== 'All') filter.category = req.query.category;
    res.json(await MenuItem.find(filter));
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.get('/all', adminAuth, async (req, res) => {
  try { res.json(await MenuItem.find()); }
  catch { res.status(500).json({ message: 'Server error' }); }
});

router.post('/', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, category, price, description } = req.body;
    let image = req.body.imageUrl || '';
    if (req.file) image = `http://localhost:5000/uploads/${req.file.filename}`;
    if (!image) return res.status(400).json({ message: 'Image required' });
    const item = await MenuItem.create({ name, category, price: parseFloat(price), description, image });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.image = `http://localhost:5000/uploads/${req.file.filename}`;
    if (updates.price) updates.price = parseFloat(updates.price);
    res.json(await MenuItem.findByIdAndUpdate(req.params.id, updates, { new: true }));
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try { await MenuItem.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
