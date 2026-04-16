const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const user = process.env.DB_USER;
    const pwd = process.env.DB_PWD;
    const uri = `mongodb+srv://${user}:${pwd}@dsaplanner.77iqxrq.mongodb.net/dsaplanner?retryWrites=true&w=majority&appName=DSAplanner`;
    const finalUri = uri;
    console.log('Attempting to connect to MongoDB URI:', finalUri.replace(pwd, '***').replace(user, '***'));

    await mongoose.connect(finalUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
