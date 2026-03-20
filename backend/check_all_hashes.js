const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');
require('dotenv').config();

const run = async () => {
  await connectDB();
  const username = 'testuser';
  const passwordsToTry = [
    'testpassword123',
    'TESTPASSWORD123',
    ' testpassword123 ',
    'testpassword123\n',
    'testpassword123\r\n',
    'password',
    'password123',
    '123456'
  ];

  const user = await User.findOne({ username: new RegExp(`^${username.trim()}$`, 'i') });
  if (!user) {
    console.log("User not found.");
    process.exit(1);
  }

  console.log(`Checking stored hash for user: ${user.username}`);
  console.log(`Stored Hash: ${user.password}`);

  for (const pw of passwordsToTry) {
    const isMatch = await bcrypt.compare(pw, user.password);
    console.log(`Try [${pw}]: ${isMatch}`);
  }

  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
