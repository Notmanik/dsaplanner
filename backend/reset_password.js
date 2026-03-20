const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');
require('dotenv').config();

const run = async () => {
  await connectDB();
  const username = process.argv[2];
  const newPassword = process.argv[3];

  if (!username || !newPassword) {
    console.error('Usage: node reset_password.js <username> <new_password>');
    process.exit(1);
  }

  const user = await User.findOne({ username: new RegExp(`^${username.trim()}$`, 'i') });
  if (!user) {
    console.log(`User ${username} not found.`);
  } else {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    console.log(`Password for user ${user.username} has been reset.`);
  }
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
