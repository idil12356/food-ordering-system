const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'User already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, hasOrdered: user.hasOrdered } });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, hasOrdered: user.hasOrdered } });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Forgot password - generate reset token and return it directly (no email needed)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with that email' });

    const resetToken = crypto.randomBytes(4).toString('hex').toUpperCase();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    // Try email
    let emailSent = false;
    if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your@gmail.com') {
      try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
        await transporter.sendMail({
          to: email,
          subject: 'Galkio Food - Password Reset Code',
          html: `<h2>Password Reset</h2><p>Your reset code: <strong style="font-size:24px;letter-spacing:4px">${resetToken}</strong></p><p>Expires in 1 hour.</p>`
        });
        emailSent = true;
      } catch (e) { console.log('Email failed:', e.message); }
    }

    // Always return the token so user can reset even without email
    res.json({
      message: emailSent ? 'Reset code sent to your email!' : 'Reset code generated!',
      resetToken,
      emailSent
    });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token.trim().toUpperCase(),
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset code' });
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset successfully!' });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
