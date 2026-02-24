const express = require('express');
const {
    issueBook,
    returnBook,
    getTransactionHistory,
    getUserTransactions,
} = require('../controllers/transactionController');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.post('/issue', verifyToken, issueBook);
router.post('/return', verifyToken, returnBook);
router.get('/history', verifyToken, getTransactionHistory);
router.get('/user', verifyToken, getUserTransactions);

module.exports = router;
