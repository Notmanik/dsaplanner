const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { validate, registerSchema, loginSchema } = require('../middleware/validate');

const normalizeUsername = (value = '') => value.trim().toLowerCase();
const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\\]\\]/g, '\\\\$&');

const generateTokens = async (userId) => {
  const payload = { user: { id: userId } };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret', { expiresIn: '7d' });

  await new RefreshToken({ userId, token: refreshToken }).save();
  return { accessToken, refreshToken };
};

const findUserForAuth = async (rawUsername) => {
  const username = normalizeUsername(rawUsername);
  let user = await User.findOne({ username });

  if (!user && username) {
    // Backward compatibility for pre-normalization usernames.
    const escaped = escapeRegex(username);
    user = await User.findOne({ username: new RegExp(`^\\s*${escaped}\\s*$`, 'i') });
  }

  return user;
};

// POST /api/auth/register
router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const username = normalizeUsername(req.body.username || '');
    const { password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ msg: 'Please provide username and password' });
    }

    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ username, password: hashedPassword });
    await user.save();

    const { accessToken, refreshToken } = await generateTokens(user.id);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ token: accessToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const username = normalizeUsername(req.body.username || '');
    const { password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ msg: 'Please provide username and password' });
    }

    const user = await findUserForAuth(username);
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (_) {
      isMatch = false;
    }

    // Backward compatibility for legacy plaintext passwords.
    if (!isMatch && user.password === password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      isMatch = true;
    }

    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const { accessToken, refreshToken } = await generateTokens(user.id);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ token: accessToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ msg: 'No refresh token' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret');
    const tokenExists = await RefreshToken.findOne({ userId: decoded.user.id, token: refreshToken });
    if (!tokenExists) return res.status(401).json({ msg: 'Invalid refresh token' });

    const payload = { user: { id: decoded.user.id } };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '15m' });

    res.json({ token: accessToken });
  } catch (err) {
    res.status(401).json({ msg: 'Invalid refresh token' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    await RefreshToken.deleteOne({ token: refreshToken });
  }
  res.clearCookie('refreshToken');
  res.json({ msg: 'Logged out' });
});

module.exports = router;
