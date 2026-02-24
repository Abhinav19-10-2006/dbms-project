const express = require('express');
const {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    getStats,
} = require('../controllers/bookController');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes (require authentication)
router.get('/stats', verifyToken, getStats);
router.get('/', verifyToken, getAllBooks);
router.get('/:id', verifyToken, getBookById);

// Admin only routes
router.post('/', verifyToken, isAdmin, createBook);
router.put('/:id', verifyToken, isAdmin, updateBook);
router.delete('/:id', verifyToken, isAdmin, deleteBook);

module.exports = router;
