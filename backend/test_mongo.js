const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const user = 'rishankyadav9_db_user';
    const pwd = 'MZGgwiAPi8jXy56r%';
    const uri = `mongodb+srv://${user}:${pwd}@dsaplanner.77iqxrq.mongodb.net/dsaplanner?retryWrites=true&w=majority&appName=DSAplanner`;

    await mongoose.connect(undefined || uri);
  } catch (error) {
    console.error('ERROR LABEL:', error.name, error.message);
  }
};
connectDB();
