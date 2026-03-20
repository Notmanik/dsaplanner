const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionId: { type: Number, required: true },
  title: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  url: { type: String },
  related_topics: [{ type: String }],
});

questionSchema.index({ related_topics: 1, difficulty: 1 });

module.exports = mongoose.model('Question', questionSchema);
