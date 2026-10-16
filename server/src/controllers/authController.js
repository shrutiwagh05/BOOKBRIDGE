const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const normalizeEmail = (email) => typeof email === 'string' ? email.trim().toLowerCase() : '';
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
const findUserByEmail = (email) => User.findOne({
  email: { $regex: '^' + escapeRegex(email) + '$', $options: 'i' },
});

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, college, department } = req.body;
    const normalizedEmail = normalizeEmail(email);
    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }
    if (await findUserByEmail(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }
    const user = await User.create({ name, email: normalizedEmail, password, college: college || '', department: department || '' });
    const token = generateToken(user._id);
    return res.status(201).json({ success: true, message: 'Account created successfully', data: {
      _id: user._id, name: user.name, email: user.email, role: user.role,
      college: user.college, department: user.department, token,
    } });
  } catch (error) { return next(error); }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }
    const user = await findUserByEmail(normalizedEmail).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: 'This account has been deactivated. Please contact an administrator.' });
    }
    const token = generateToken(user._id);
    return res.status(200).json({ success: true, message: 'Login successful', data: {
      _id: user._id, name: user.name, email: user.email, role: user.role,
      college: user.college, department: user.department, token,
    } });
  } catch (error) { return next(error); }
};

const getMe = async (req, res, next) => {
  try { return res.status(200).json({ success: true, data: req.user }); }
  catch (error) { return next(error); }
};

const requestPasswordReset = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body && req.body.email);
    const genericMessage = 'If an account exists for that email, a reset link will be sent.';
    if (!email) return res.status(200).json({ success: true, message: genericMessage });
    const user = await findUserByEmail(email);
    if (!user || user.isActive === false) return res.status(200).json({ success: true, message: genericMessage });

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.MAIL_FROM;
    const clientUrl = process.env.CLIENT_URL;
    if (!apiKey || !from || !clientUrl) {
      console.error('[PasswordReset] Email configuration is incomplete.');
      return res.status(503).json({ success: false, message: 'Password reset email is temporarily unavailable. Please try again later.' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const resetUrl = new URL('/reset-password', clientUrl);
    resetUrl.searchParams.set('token', rawToken);
    let response;
    try {
      response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from,
          to: [user.email],
          subject: 'Reset your BookBridge password',
          html: '<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>Reset your BookBridge password</h2><p>We received a request to reset your password. This link expires in 15 minutes.</p><p><a href="' + resetUrl.toString() + '">Reset password</a></p><p>If you did not request this, you can ignore this email.</p></div>',
          text: 'Reset your BookBridge password using this link (expires in 15 minutes): ' + resetUrl.toString(),
        }),
      });
    } catch (error) {
      console.error('[PasswordReset] Email provider request failed:', error.message);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(503).json({ success: false, message: 'Password reset email is temporarily unavailable. Please try again later.' });
    }

    if (!response.ok) {
      console.error('[PasswordReset] Email provider returned status:', response.status);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(503).json({ success: false, message: 'Password reset email is temporarily unavailable. Please try again later.' });
    }
    return res.status(200).json({ success: true, message: genericMessage });
  } catch (error) { return next(error); }
};

const resetPassword = async (req, res, next) => {
  try {
    const body = req.body || {};
    const token = body.token;
    const password = body.password;
    if (typeof token !== 'string' || !token || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, message: 'A valid reset token and a password of at least 6 characters are required.' });
    }
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
      isActive: { $ne: false },
    }).select('+passwordResetToken +passwordResetExpires +password');
    if (!user) {
      return res.status(400).json({ success: false, message: 'This password reset link is invalid or has expired. Please request a new one.' });
    }
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return res.status(200).json({ success: true, message: 'Password reset successfully. You can now sign in with your new password.' });
  } catch (error) { return next(error); }
};

module.exports = { registerUser, loginUser, getMe, requestPasswordReset, resetPassword };
