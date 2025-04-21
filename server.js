const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');

const app = express();
const prisma = new PrismaClient();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));


app.get("/api/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, username: true } });
    res.json(users.map(user => ({ _id: user.id, username: user.username })));
  } catch (error) {
    res.status(500).json({ error: "SAn error occurred while fetching users" });
  }
});


app.post('/api/users', async (req, res) => {
  const { username } = req.body;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Invalid username' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const newUser = await prisma.user.create({ data: { username } });
    res.json({ username: newUser.username, _id: newUser.id });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'An error occurred while adding the user' });
  }
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  try {
    const { _id } = req.params;
    const { description, duration, date } = req.body;

    // Check for valid input
    if (!description || !duration) {
      return res.status(400).json({ error: "Description and duration are required" });
    }
    if (isNaN(duration) || parseInt(duration, 10) <= 0) {
      return res.status(400).json({ error: "Invalid duration value, expecting a positive number" });
    }
    if (date && isNaN(Date.parse(date))) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Find user by ID using Prisma
    const user = await prisma.user.findUnique({ where: { id: parseInt(_id) } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Create the exercise entry using Prisma
    const exercise = await prisma.exercise.create({
      data: {
        userId: user.id,
        description,
        duration: parseInt(duration),
        date: date ? new Date(date) : new Date(),
      },
    });

    // Send response
    res.json({
      _id: user.id,
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString(),
    });
  } catch (error) {
    console.error("Error adding exercise:", error);
    res.status(500).json({ error: "Server error" });
  }
});



// app.get("/api/users/:_id/logs", async (req, res) => {
//   try {
//     let { _id } = req.params;
//     const { from, to, limit } = req.query;

//     _id = parseInt(_id, 10);
//     if (isNaN(_id)) {
//       return res.status(400).json({ error: 'Invalid user ID' });
//     }

//     // Check if the user exists
//     const user = await prisma.user.findUnique({ where: { id: _id } });
//     if (!user) return res.status(404).json({ error: "User not found" });

//     // Date validation for 'from' and 'to' query parameters
//     let filters = { userId: _id };
//     if (from || to) {
//       filters.date = {};
//       if (from) {
//         if (isNaN(Date.parse(from))) {
//           return res.status(400).json({ error: "Invalid 'from' date format" });
//         }
//         filters.date.gte = new Date(from);
//       }
//       if (to) {
//         if (isNaN(Date.parse(to))) {
//           return res.status(400).json({ error: "Invalid 'to' date format" });
//         }
//         filters.date.lte = new Date(to);
//       }
//     }


//     // Fetch exercises with the filters
//     const exercises = await prisma.exercise.findMany({
//       where: filters,
//       orderBy: { date: 'asc' },
//       take: limitValue,
//       select: { description: true, duration: true, date: true },
//     });

//     const limitedExercises = limit
//       ? exercises.slice(0, parseInt(limit, 10))
//       : exercises;

//     res.json({
//       _id: user.id,
//       username: user.username,
//       count: limitedExercises.length,
//       log: limitedExercises.map(ex => ({
//         description: ex.description,
//         duration: ex.duration,
//         date: ex.date.toDateString(),
//       })),
//     });
//   } catch (error) {
//     console.error("Error fetching exercise logs:", error);
//     res.status(500).json({ error: "An error occurred while fetching exercise logs" });
//   }
// });
app.get("/api/users/:_id/logs", async (req, res) => {
  try {
    let { _id } = req.params;
    const { from, to, limit } = req.query;

    _id = parseInt(_id, 10);
    if (isNaN(_id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({ where: { id: _id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Build date filters
    const filters = { userId: _id };
    if (from || to) {
      filters.date = {};
      if (from) {
        if (isNaN(Date.parse(from))) {
          return res.status(400).json({ error: "Invalid 'from' date format" });
        }
        filters.date.gte = new Date(from);
      }
      if (to) {
        if (isNaN(Date.parse(to))) {
          return res.status(400).json({ error: "Invalid 'to' date format" });
        }
        filters.date.lte = new Date(to);
      }
    }

    // Fetch all matching exercises (sorted ASC)
    const allExercises = await prisma.exercise.findMany({
      where: filters,
      orderBy: { date: 'asc' },
      select: { description: true, duration: true, date: true },
    });

    // Apply limit manually AFTER filtering
    const limitedExercises = limit
      ? allExercises.slice(0, parseInt(limit, 10))
      : allExercises;

    res.json({
      _id: user.id,
      username: user.username,
      count: allExercises.length, // count BEFORE applying limit
      log: limitedExercises.map(ex => ({
        description: ex.description,
        duration: ex.duration,
        date: ex.date.toDateString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching exercise logs:", error);
    res.status(500).json({ error: "An error occurred while fetching exercise logs" });
  }
});

app.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});
