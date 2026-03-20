const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');
require('dotenv').config();

const run = async () => {
  await connectDB();
  const users = await User.find({});
  console.log(`Found ${users.length} users.`);
  users.forEach(u => {
    console.log(`Username: ${u.username}`);
    console.log(`Password (first 10 chars): ${u.password.substring(0, 10)}...`);
    const isHash = u.password.startsWith('$2a$') || u.password.startsWith('$2b$');
    console.log(`Is hash? ${isHash}`);
    console.log('---');
  });
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
