const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addExercise = async (req, res) => {
  try {
    const { _id } = req.params;
    const { description, duration, date } = req.body;

    if (!description || !duration) {
      return res.status(400).json({ error: 'Description and duration required' });
    }

    const user = await prisma.user.findUnique({ where: { id: parseInt(_id) } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const exercise = await prisma.exercise.create({
      data: {
        userId: user.id,
        description,
        duration: parseInt(duration),
        date: date ? new Date(date) : new Date(),
      },
    });

    res.json({
      _id: user.id,
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getUserLogs = async (req, res) => {
  try {
    const { _id } = req.params;
    const { from, to, limit } = req.query;

    const user = await prisma.user.findUnique({ where: { id: parseInt(_id) } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const filters = { userId: user.id };
    if (from || to) {
      filters.date = {};
      if (from) filters.date.gte = new Date(from);
      if (to) filters.date.lte = new Date(to);
    }

    const parsedLimit = limit ? parseInt(limit) : undefined;

    const [count, logs] = await Promise.all([
      prisma.exercise.count({ where: filters }),
      prisma.exercise.findMany({
        where: filters,
        orderBy: { date: 'asc' },
        take: parsedLimit,
        select: { description: true, duration: true, date: true },
      }),
    ]);

    res.json({
      _id: user.id,
      username: user.username,
      count,
      log: logs.map(ex => ({
        description: ex.description,
        duration: ex.duration,
        date: ex.date.toDateString(),
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get logs' });
  }
};

module.exports = { addExercise, getUserLogs };
