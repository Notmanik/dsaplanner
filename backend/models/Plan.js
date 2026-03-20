const mongoose = require('mongoose');

const planQuestionSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  status: { type: String, enum: ['pending', 'completed', 'skipped'], default: 'pending' },
  score: { type: Number, min: 0, max: 5 },
  easeFactor: { type: Number, default: 2.5 },
  interval: { type: Number, default: 0 },
  repetitions: { type: Number, default: 0 }
});

const dailyPlanSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  questions: [planQuestionSchema]
});

const planSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true, default: 'Untitled Plan' },
  duration: { type: Number, required: true },
  startDate: { type: Date, required: true },
  userLevels: {
    type: Map, // key: topic, value: level (1 to 5)
    of: Number,
    required: true
  },
  dailyPlan: [dailyPlanSchema],
  createdAt: { type: Date, default: Date.now }
});

planSchema.index({ userId: 1 });
planSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Plan', planSchema);
