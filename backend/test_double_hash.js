const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');
require('dotenv').config();

const run = async () => {
  await connectDB();
  const username = 'testuser';
  const password = 'testpassword123';

  const user = await User.findOne({ username: new RegExp(`^${username.trim()}$`, 'i') });
  const storedHash = user.password;
  
  console.log(`Stored Hash: ${storedHash}`);
  
  // Test if storedHash is a hash of (hash of password)
  const salt = storedHash.substring(0, 29); // Extract salt from stored hash
  const firstHash = await bcrypt.hash(password, 10); // We don't know the first salt, but we can try common ones or just check if ANY hash of password matches
  
  // Actually, bcrypt.compare(plain, hash) works by hashing plain with salt from hash.
  // If double hashed: bcrypt.compare(plain, doubleHash) -> hash(plain, saltFromDoubleHash) == doubleHash? NO.
  
  // To check double hash:
  // 1. Generate some hash of password: H1 = bcrypt.hash(password, someSalt)
  // 2. See if bcrypt.compare(H1, storedHash) is true? NO, salts must match.
  
  // If it was double hashed with salt S1 then salt S2:
  // storedHash = hash(hash(password, S1), S2)
  // bcrypt.compare(anything, storedHash) will hash 'anything' with S2 and compare with storedHash.
  // So we need to find X such that hash(X, S2) == storedHash.
  // We can't find X from storedHash, but we can guess X is a hash of 'password'.
  
  // But wait, bcrypt.compare(password, storedHash) returned false.
  // If I do:
  // const isDoubleMatch = await bcrypt.compare(await bcrypt.hash(password, 10), storedHash);
  // This won't work because bcrypt.hash(password, 10) uses a NEW random salt.
  
  // We need to use the SAME salt that was used for the first hash. We don't have it.
  
  // HOWEVER, we can check if the storedHash is a hash of "testpassword123" by trying a few common things.
  // Wait, I have an idea.
  
  console.log("Checking if storedHash is a hash of 'testpassword123'...");
  console.log("Direct compare:", await bcrypt.compare(password, storedHash));

  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
