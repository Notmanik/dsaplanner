const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true, minlength: 3 },
  password: { type: String, required: true },
  uniqueCode: { type: String, required: true, unique: true },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: null },
  activePlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', default: null },
});

module.exports = mongoose.model('User', userSchema);
