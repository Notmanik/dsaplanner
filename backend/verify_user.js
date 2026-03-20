const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');
require('dotenv').config();

const run = async () => {
  await connectDB();
  const username = process.argv[2] || 'testuser';
  const password = process.argv[3] || 'testpassword123';

  console.log(`Checking user: ${username}`);
  const user = await User.findOne({ username });
  if (!user) {
    console.log('User not found.');
    process.exit(1);
  }

  console.log('Stored hash:', user.password);
  const isMatch = await bcrypt.compare(password, user.password);
  console.log('Password comparison result:', isMatch);

  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
