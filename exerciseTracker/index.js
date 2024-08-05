const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path=require('path')

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = 'mongodb+srv://ravanyars2000:LRLjUMt31J66zrLT@cluster0.gvpa8n1.mongodb.net/Employee_ManagementDB';

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Middleware
app.use(express.static('public')); // Serve static files from 'public' directory
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Define Mongoose schema and models
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true },
});

const exerciseSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle POST request to create a new user
app.post('/api/users', async (req, res) => {
  try {
    const { username } = req.body;
    const newUser = new User({ username });
    await newUser.save();
    res.json({ id: newUser._id, username: newUser.username });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Handle GET request to fetch all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username');
    res.json(users);
  } catch (error) {
    res.status(404).json({ error: 'Users not found' });
  }
});

// Handle POST request to add an exercise for a user
app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const { description, duration, date } = req.body;
    const userId = req.params._id;

    // Validate required fields
    if (!description || !duration) {
      throw new Error('Description and Duration are required.');
    }

    // Create new exercise
    const newExercise = new Exercise({
      userId,
      description,
      duration,
      date: date ? new Date(date) : new Date(),
    });

    await newExercise.save();

    res.json({
      userId: newExercise.userId,
      exerciseId: newExercise._id,
      duration: newExercise.duration,
      description: newExercise.description,
      date: newExercise.date.toISOString().split('T')[0],
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


app.get('/api/users/:_id/logs', async (req, res) => {
    
      const _id = req.params._id;
      const { from, to, limit } = req.query;

  try {
    const user = await User.findById(_id);
    if (!user) {
      throw new Error('User not found');
    }

    let query = { userId: _id };
    if (from && to) {
      query.date = { $gte: new Date(from), $lte: new Date(to) };
    }

    let exercisesQuery = Exercise.find(query);
    if (limit) {
      exercisesQuery = exercisesQuery.limit(parseInt(limit));
    }

    const exercises = await exercisesQuery;

    const userExerciseLog = {
      _id: user._id,
      username: user.username,
      log: exercises.map(exercise => ({
        id: exercise._id,
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toISOString().split('T')[0],
      })),
      count: exercises.length,
    };

    res.json(userExerciseLog);
  }catch (error) {
    res.status(404).json({ error: error.message });
  }
});
  

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
