const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');

const app = express();
const prisma = new PrismaClient();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));


app.get('/all-users', (req, res) => {
  res.sendFile(__dirname + '/public/all-users.html');
});


app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching users' });
  }
});

app.get('/error/user-exists', (req, res) => {
  
  res.send(`<h3>Error: User already exists.</h3>`);
});

app.post('/api/users', async (req, res) => {
  const { username } = req.body;

  try {
    
    const existingUser = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (existingUser) {
      return res.status(404).json({ error: 'User already exist' });  
    }

  
    const newUser = await prisma.user.create({
      data: {
        username: username,
       
      },
    });

    res.json(newUser); 
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'An error occurred while adding the user' });
  }
});



app.get('/api/users/:id/logs', async (req, res) => {
  const userId = parseInt(req.params.id); 
  const { from, to, limit } = req.query;

  const dateFilter = {};
  if (from) {
    dateFilter.date = {
        gte: new Date(from),
    };
}
if (to) {
  dateFilter.date = {
        ...dateFilter.date,
        lte: new Date(to),
    };
}

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const exercises = await prisma.exercise.findMany({
      where: { userId: userId },
      ...dateFilter,
      select: {
        id: true,
        description: true,
        duration: true,
        date: true,
      },
      orderBy: { date: 'desc' }, 
            
            take : limit ? parseInt(limit) : 10,
    });
    const totalCount = await prisma.exercise.count({
      where: {
          userId: parseInt(userId),
          ...dateFilter
      }
  });
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        
      },
      count: totalCount,
      log: exercises,
    });
  } catch (error) {
    console.error('Error fetching exercise logs:', error);
    res.status(500).json({ error: 'An error occurred while fetching exercise logs' });
  }
});



app.post('/api/users/:id/exercises', async (req, res) => {
  const userId = parseInt(req.params.id, 10); 
  const { description, duration, date } = req.body; 

  if (!description || !duration) {
    return res.status(400).json({ error: 'Description and duration are required' });
  }

  try {
   
    const exercise = await prisma.exercise.create({
      data: {
        userId: userId,
        description: description,
        duration: parseInt(duration, 10),
        date: date ? new Date(date) : new Date(), 
      },
    });

    
    res.json({
      _id: exercise.id,
      username: userId, 
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toISOString(),
    });
  } catch (error) {
    console.error('Error creating exercise:', error);
    res.status(500).json({ error: 'An error occurred while adding the exercise' });
  }
});


app.get('/users/:userId/exercises/:exerciseId', async (req, res) => {
  const { userId, exerciseId } = req.params;

  try {
    const exercise = await prisma.exercise.findUnique({
      where: {
        id: parseInt(exerciseId, 10), 
      },
    });

    if (!exercise) {
      return res.status(404).send('Exercise not found');
    }

    if (exercise.userId !== parseInt(userId, 10)) {
      return res.status(403).send('Forbidden: You do not have access to this exercise');
    }

  
    res.json({
      id: exercise.id,
      userId: exercise.userId,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date,
    });
  } catch (error) {
    console.error('Error retrieving exercise:', error);
    res.status(500).send('An error occurred while retrieving the exercise');
  }
});


app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id, 10),
      },
    });

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.json({
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    res.status(500).send('An error occurred while retrieving the user');
  }
});







app.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});
