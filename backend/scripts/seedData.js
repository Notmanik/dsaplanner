const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Question = require('../models/Question');
const connectDB = require('../config/db');

const seedData = async () => {
  await connectDB();
  
  // Clear existing questions to avoid duplicates on re-run
  await Question.deleteMany({});
  console.log('Cleared existing questions');

  const questions = [];

  fs.createReadStream(path.join(__dirname, '../data.csv'))
    .pipe(csv())
    .on('data', (data) => {
      if (data.id && data.title && data.difficulty) {
        let topics = [];
        if (data.related_topics) {
          // split by comma, handling potential spaces
          topics = data.related_topics.split(',').map(t => t.trim());
        }
        
        questions.push({
          questionId: parseInt(data.id),
          title: data.title,
          difficulty: data.difficulty,
          url: data.url || '',
          related_topics: topics
        });
      }
    })
    .on('end', async () => {
      try {
        await Question.insertMany(questions);
        console.log(`Successfully seeded ${questions.length} questions`);
        process.exit(0);
      } catch (err) {
        console.error('Error inserting questions:', err);
        process.exit(1);
      }
    });
};

seedData();
