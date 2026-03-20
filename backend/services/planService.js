const Question = require('../models/Question');
const Plan = require('../models/Plan');

// Helper to get questions by difficulty and topic
const getQuestions = async (topic, difficulty, limit) => {
  if (limit <= 0) return [];
  return await Question.aggregate([
    { $match: { 
        related_topics: { $regex: new RegExp(`^${topic}$`, 'i') }, 
        difficulty: difficulty 
      } 
    },
    { $sample: { size: limit } }
  ]);
};

exports.generatePlan = async (userLevels, duration, startDateStr, userId, name) => {
  const questionsPerDay = 3;
  const totalQuestionsNeeded = duration * questionsPerDay; 
  
  const topics = Object.keys(userLevels);
  if (topics.length === 0) throw new Error("No topics provided");

  const questionsPerTopic = Math.ceil(totalQuestionsNeeded / topics.length);
  
  let selectedQuestions = [];

  for (const topic of topics) {
    const level = parseInt(userLevels[topic]);
    let easyCount = 0, mediumCount = 0, hardCount = 0;

    if (level === 1) { easyCount = Math.round(questionsPerTopic * 0.8); mediumCount = questionsPerTopic - easyCount; }
    else if (level === 2) { easyCount = Math.round(questionsPerTopic * 0.5); mediumCount = questionsPerTopic - easyCount; }
    else if (level === 3) { easyCount = Math.round(questionsPerTopic * 0.2); mediumCount = Math.round(questionsPerTopic * 0.6); hardCount = questionsPerTopic - easyCount - mediumCount; }
    else if (level === 4) { mediumCount = Math.round(questionsPerTopic * 0.6); hardCount = questionsPerTopic - mediumCount; }
    else if (level === 5) { mediumCount = Math.round(questionsPerTopic * 0.2); hardCount = questionsPerTopic - mediumCount; }

    const easyQs = await getQuestions(topic, 'Easy', easyCount);
    const medQs = await getQuestions(topic, 'Medium', mediumCount);
    const hardQs = await getQuestions(topic, 'Hard', hardCount);

    selectedQuestions.push(...easyQs, ...medQs, ...hardQs);
  }

  // Shuffle selected questions
  selectedQuestions = selectedQuestions.sort(() => 0.5 - Math.random());

  const dailyPlan = [];
  let qIndex = 0;
  const start = new Date(startDateStr);

  for (let i = 1; i <= duration; i++) {
    const dayQuestions = [];
    const currentDate = new Date(start);
    currentDate.setDate(currentDate.getDate() + (i - 1));

    for (let j = 0; j < questionsPerDay; j++) {
      if (qIndex < selectedQuestions.length) {
        dayQuestions.push({ questionId: selectedQuestions[qIndex]._id });
        qIndex++;
      }
    }
    // Only add a day if it has questions
    if (dayQuestions.length > 0) {
      dailyPlan.push({ date: currentDate, questions: dayQuestions });
    }
  }

  const plan = new Plan({
    userId,
    name: (name || `Plan ${new Date(startDateStr).toISOString().split('T')[0]}`).trim(),
    duration,
    startDate: start,
    userLevels,
    dailyPlan
  });

  await plan.save();
  return plan;
};
