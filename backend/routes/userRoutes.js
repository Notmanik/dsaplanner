const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Plan = require('../models/Plan');
const auth = require('../middleware/auth');

router.get('/me/streak', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('streak lastActiveDate');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me/analytics', auth, async (req, res) => {
  try {
    const plans = await Plan.find({ userId: req.user.id }).populate('dailyPlan.questions.questionId');
    
    // Aggregate weak topics based on SM-2 score averages
    const topicStats = {};
    
    plans.forEach(plan => {
      plan.dailyPlan.forEach(day => {
        day.questions.forEach(q => {
          if (q.status === 'completed' && q.questionId) {
            const topics = q.questionId.related_topics || [];
            topics.forEach(t => {
              if (!topicStats[t]) topicStats[t] = { count: 0, totalScore: 0 };
              topicStats[t].count += 1;
              topicStats[t].totalScore += q.score;
            });
          }
        });
      });
    });

    const analytics = Object.keys(topicStats).map(topic => ({
      topic,
      averageScore: parseFloat((topicStats[topic].totalScore / topicStats[topic].count).toFixed(2)),
      questionsCompleted: topicStats[topic].count
    })).sort((a, b) => a.averageScore - b.averageScore);

    res.json({ weakTopics: analytics });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
