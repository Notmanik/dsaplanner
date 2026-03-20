const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');
require('dotenv').config();

const run = async () => {
  await connectDB();
  const username = process.argv[2];
  const password = process.argv[3];

  if (!username || !password) {
    console.error('Usage: node debug_login.js <username> <password>');
    process.exit(1);
  }

  const user = await User.findOne({ username: new RegExp(`^${username.trim()}$`, 'i') });
  if (!user) {
    console.log(`User ${username} not found.`);
  } else {
    console.log(`User found: ${user.username}`);
    console.log(`Stored password: ${user.password}`);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Bcrypt compare result: ${isMatch}`);
    
    const manualHash = await bcrypt.hash(password, 10);
    console.log(`Manual hash of provided password: ${manualHash}`);
  }
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
