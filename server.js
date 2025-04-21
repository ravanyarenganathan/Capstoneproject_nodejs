const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/user.routes');
const exerciseRoutes = require('./routes/exercise.routes');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Route handling
app.use('/api/users', userRoutes);
app.use('/api/users', exerciseRoutes); // all exercise and logs under /api/users/:_id

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
