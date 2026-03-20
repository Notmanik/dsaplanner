const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');
require('dotenv').config();

const run = async () => {
  await connectDB();
  const users = await User.find({});
  const commonPasswords = ['password', 'password123', '123456', 'testpassword123'];

  for (const user of users) {
    console.log(`Checking user: ${user.username}`);
    for (const pw of commonPasswords) {
      if (await bcrypt.compare(pw, user.password)) {
        console.log(`  Matches: ${pw}`);
      }
    }
  }

  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
