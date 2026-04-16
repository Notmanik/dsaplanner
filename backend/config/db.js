const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const user = process.env.DB_USER;
    const pwd = process.env.DB_PWD;
    const uri = `mongodb+srv://${user}:${pwd}@dsaplanner.77iqxrq.mongodb.net/dsaplanner?retryWrites=true&w=majority&appName=DSAplanner`;

    await mongoose.connect(process.env.MONGO_URI || uri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
