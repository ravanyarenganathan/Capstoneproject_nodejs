const express = require('express');
const { createUser, getAllUsers } = require('../handlers/user.handler');

const router = express.Router();

router.post('/', createUser);
router.get('/', getAllUsers);

module.exports = router;
