const express = require('express');
const { getAllUsers, deleteUser } = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and admin privileges
router.get('/', verifyToken, isAdmin, getAllUsers);
router.delete('/:id', verifyToken, isAdmin, deleteUser);

module.exports = router;
