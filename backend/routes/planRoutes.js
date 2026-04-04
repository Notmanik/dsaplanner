const express = require('express');
const router = express.Router();
const planService = require('../services/planService');
const Plan = require('../models/Plan');
const User = require('../models/User');
const auth = require('../middleware/auth');
const sm2Service = require('../services/sm2Service');
const { validate, generatePlanSchema, completeProblemSchema } = require('../middleware/validate');

const hydratePlanName = (plan) => {
  if (!plan) return plan;
  if (!plan.name || !String(plan.name).trim()) {
    plan.name = `Plan ${new Date(plan.startDate || plan.createdAt || Date.now()).toISOString().split('T')[0]}`;
  }
  return plan;
};

router.post('/generate', auth, validate(generatePlanSchema), async (req, res) => {
  try {
    const { userLevels, duration, startDate, name } = req.body;
    if (!userLevels || !duration || !startDate) {
      return res.status(400).json({ error: 'userLevels, duration, and startDate are required' });
    }

    const plan = await planService.generatePlan(userLevels, duration, startDate, req.user.id, name);

    // New plans become active by default.
    await User.findByIdAndUpdate(req.user.id, { activePlanId: plan._id });

    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const plans = await Plan.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('dailyPlan.questions.questionId', 'difficulty related_topics');

    const summarized = plans.map((plan) => {
      hydratePlanName(plan);

      const total = plan.dailyPlan.reduce((acc, day) => acc + day.questions.length, 0);
      const solved = plan.dailyPlan.reduce(
        (acc, day) => acc + day.questions.filter((q) => q.status === 'completed' || q.status === 'skipped').length,
        0
      );

      return {
        _id: plan._id,
        name: plan.name,
        duration: plan.duration,
        startDate: plan.startDate,
        createdAt: plan.createdAt,
        totalQuestions: total,
        solvedQuestions: solved,
        completionPct: total > 0 ? Number(((solved / total) * 100).toFixed(1)) : 0,
      };
    });

    res.json(summarized);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me/active', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('activePlanId');

    let plan = null;

    if (user?.activePlanId) {
      plan = await Plan.findOne({ _id: user.activePlanId, userId: req.user.id }).populate('dailyPlan.questions.questionId');
    }

    if (!plan) {
      plan = await Plan.findOne({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .populate('dailyPlan.questions.questionId');

      if (plan) {
        await User.findByIdAndUpdate(req.user.id, { activePlanId: plan._id });
      }
    }

    if (!plan) return res.status(200).json(null);

    hydratePlanName(plan);
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/select', auth, async (req, res) => {
  try {
    const plan = await Plan.findOne({ _id: req.params.id, userId: req.user.id });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    await User.findByIdAndUpdate(req.user.id, { activePlanId: plan._id });
    hydratePlanName(plan);
    res.json({ msg: 'Active plan updated', activePlanId: plan._id, planName: plan.name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const plan = await Plan.findOne({ _id: req.params.id, userId: req.user.id });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const user = await User.findById(req.user.id).select('activePlanId');
    const isActivePlan = user?.activePlanId && user.activePlanId.toString() === plan._id.toString();

    await Plan.deleteOne({ _id: plan._id });

    if (isActivePlan) {
      const nextPlan = await Plan.findOne({ userId: req.user.id }).sort({ createdAt: -1 }).select('_id');
      await User.findByIdAndUpdate(req.user.id, { activePlanId: nextPlan?._id ?? null });
    }

    res.json({
      msg: 'Plan deleted',
      deletedPlanId: plan._id,
      activePlanId: isActivePlan
        ? ((await User.findById(req.user.id).select('activePlanId'))?.activePlanId ?? null)
        : user?.activePlanId ?? null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id).populate('dailyPlan.questions.questionId');
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    // Check user ownership
    if (plan.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    hydratePlanName(plan);
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/complete', auth, validate(completeProblemSchema), async (req, res) => {
  try {
    const { questionId, score, status } = req.body;
    if (score === undefined || !status || !questionId) {
      return res.status(400).json({ msg: 'Missing questionId, score, or status' });
    }

    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ msg: 'Plan not found' });
    if (plan.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    let targetDate = null;
    let targetQuestion = null;

    // Find the question in the plan
    for (let i = 0; i < plan.dailyPlan.length; i++) {
      const qIdx = plan.dailyPlan[i].questions.findIndex(q => q.questionId.toString() === questionId);
      if (qIdx !== -1) {
        targetDate = plan.dailyPlan[i].date;
        targetQuestion = plan.dailyPlan[i].questions[qIdx];
        break;
      }
    }

    if (!targetQuestion) {
      return res.status(404).json({ msg: 'Question not found in plan' });
    }

    targetQuestion.status = status;
    targetQuestion.score = score;

    // Apply SM-2
    const { interval, repetitions, easeFactor } = sm2Service.calculateSM2(
      score,
      targetQuestion.repetitions,
      targetQuestion.interval,
      targetQuestion.easeFactor
    );

    targetQuestion.interval = interval;
    targetQuestion.repetitions = repetitions;
    targetQuestion.easeFactor = easeFactor;

    // Reschedule skipped questions or questions needing review
    if (status === 'skipped' || interval > 0) {
      const nextReviewDate = new Date(targetDate);
      nextReviewDate.setDate(nextReviewDate.getDate() + (status === 'skipped' ? 1 : interval));

      let targetBucket = plan.dailyPlan.find(d => d.date.toISOString() === nextReviewDate.toISOString());

      if (!targetBucket) {
        plan.dailyPlan.push({ date: nextReviewDate, questions: [] });
        targetBucket = plan.dailyPlan[plan.dailyPlan.length - 1];
      }

      const exists = targetBucket.questions.some(q => q.questionId.toString() === questionId);
      if (!exists) {
        targetBucket.questions.push({
          questionId: questionId,
          status: 'pending',
          score: 0,
          easeFactor: easeFactor,
          interval: interval,
          repetitions: repetitions
        });
      }
    }

    if (status === 'completed') {
      const user = await User.findById(req.user.id);
      if (user) {
        const now = new Date();
        if (!user.lastActiveDate) {
          user.streak = 1;
          user.lastActiveDate = now;
        } else {
          const lastActive = new Date(user.lastActiveDate);

          // Calculate pure day difference
          const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const lastActiveDate = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
          const diffTime = Math.abs(todayDate - lastActiveDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            user.streak += 1;
            user.lastActiveDate = now;
          } else if (diffDays > 1) {
            user.streak = 1;
            user.lastActiveDate = now;
          }
          // diffDays === 0 means streak already counted for today
        }
        await user.save();
      }
    }

    plan.dailyPlan.sort((a, b) => new Date(a.date) - new Date(b.date));
    await plan.save();

    res.json(plan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
