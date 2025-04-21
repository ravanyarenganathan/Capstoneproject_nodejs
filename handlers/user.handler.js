const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createUser = async (req, res) => {
  const { username } = req.body;
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Invalid username' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) return res.status(409).json({ error: 'User already exists' });

    const newUser = await prisma.user.create({ data: { username } });
    res.json({ username: newUser.username, _id: newUser.id });
  } catch (err) {
    res.status(500).json({ error: 'Error creating user' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, username: true } });
    res.json(users.map(user => ({ _id: user.id, username: user.username })));
  } catch (err) {
    res.status(500).json({ error: 'Error fetching users' });
  }
};

module.exports = { createUser, getAllUsers };
