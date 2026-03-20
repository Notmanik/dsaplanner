const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');
require('dotenv').config();

const run = async () => {
  await connectDB();
  
  // Simulation of EXACTLY what the route does
  const reqBody = {
    username: 'manik_exact',
    password: 'password123'
  };

  const { username, password } = reqBody;
  
  // 1. Find if exists
  let user = await User.findOne({ username: new RegExp(`^${username.trim()}$`, 'i') });
  if (user) await User.deleteOne({ _id: user._id });

  // 2. Register
  user = new User({ username, password });
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  await user.save();
  
  console.log(`Saved user ${user.username} with hash ${user.password}`);

  // 3. Login Simulation
  const loginUser = await User.findOne({ username: new RegExp(`^${username.trim()}$`, 'i') });
  const isMatch = await bcrypt.compare(password, loginUser.password);
  
  console.log(`Login match for ${username}: ${isMatch}`);
  
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
