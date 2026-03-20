const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');
require('dotenv').config();

const run = async () => {
  await connectDB();
  const username = 'testuser_' + Date.now();
  const password = 'testpassword123';

  console.log(`Creating user: ${username}`);
  let user = new User({ username, password });
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  await user.save();
  console.log('User created');

  const foundUser = await User.findOne({ username });
  console.log('Found user in DB:', foundUser.username);
  console.log('Stored hash:', foundUser.password);

  const isMatch = await bcrypt.compare(password, foundUser.password);
  console.log('Password comparison result:', isMatch);

  if (isMatch) {
    console.log('Success: Registered and logged in successfully.');
  } else {
    console.error('Error: Password mismatch after registration.');
  }

  // Cleanup
  await User.deleteOne({ username });
  console.log('Test user deleted');
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
