const { query } = require('../config/db');
const { calculateFine } = require('../utils/transactionUtils');

/**
 * Issue a book to a user
 * POST /api/transactions/issue
 */
const issueBook = async (req, res, next) => {
    try {
        const { book_id, due_date } = req.body;
        const user_id = req.user.id; // From JWT token

        // Validation
        if (!book_id) {
            return res.status(400).json({
                success: false,
                message: 'Please provide book_id.',
            });
        }

        // Check if book exists and is available
        const bookResult = await query('SELECT * FROM books WHERE id = $1', [book_id]);

        if (bookResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Book not found.',
            });
        }

        const book = bookResult.rows[0];

        if (book.available_quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Book is not available. All copies are currently issued.',
            });
        }

        // Check if user already has this book issued
        const existingTransaction = await query(
            'SELECT * FROM transactions WHERE user_id = $1 AND book_id = $2 AND status = $3',
            [user_id, book_id, 'ISSUED']
        );

        if (existingTransaction.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'You have already issued this book. Please return it before issuing again.',
            });
        }

        const virtualDate = req.headers['x-virtual-date'];
        const baseDate = virtualDate ? new Date(virtualDate) : new Date();

        // Calculate due date (14 days from baseDate if not provided)
        let finalDueDate = due_date;
        if (!finalDueDate) {
            const d = new Date(baseDate);
            d.setDate(d.getDate() + 14);
            finalDueDate = d.toISOString().split('T')[0];
        }

        const issueDate = baseDate.toISOString().split('T')[0];

        // Start transaction
        await query('BEGIN');

        try {
            // Create transaction record
            const transactionResult = await query(
                'INSERT INTO transactions (user_id, book_id, issue_date, due_date, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [user_id, book_id, issueDate, finalDueDate, 'ISSUED']
            );

            // Decrement available quantity
            await query(
                'UPDATE books SET available_quantity = available_quantity - 1 WHERE id = $1',
                [book_id]
            );

            // Commit transaction
            await query('COMMIT');

            res.status(201).json({
                success: true,
                message: 'Book issued successfully.',
                data: transactionResult.rows[0],
            });
        } catch (error) {
            // Rollback on error
            await query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Return a book
 * POST /api/transactions/return
 */
const returnBook = async (req, res, next) => {
    try {
        const { transaction_id } = req.body;
        const user_id = req.user.id;

        // Validation
        if (!transaction_id) {
            return res.status(400).json({
                success: false,
                message: 'Please provide transaction_id.',
            });
        }

        // Get transaction
        const transactionResult = await query(
            'SELECT * FROM transactions WHERE id = $1',
            [transaction_id]
        );

        if (transactionResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found.',
            });
        }

        const transaction = transactionResult.rows[0];

        // Check if transaction belongs to user (unless admin)
        if (req.user.role !== 'ADMIN' && transaction.user_id !== user_id) {
            return res.status(403).json({
                success: false,
                message: 'You can only return your own books.',
            });
        }

        // Check if book is already returned
        if (transaction.status === 'RETURNED') {
            return res.status(400).json({
                success: false,
                message: 'Book has already been returned.',
            });
        }

        // Start transaction
        await query('BEGIN');

        try {
            const virtualDate = req.headers['x-virtual-date'];
            const returnDate = virtualDate ? new Date(virtualDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

            // Update transaction record
            const updatedTransaction = await query(
                'UPDATE transactions SET return_date = $1, status = $2 WHERE id = $3 RETURNING *',
                [returnDate, 'RETURNED', transaction_id]
            );

            // Increment available quantity
            await query(
                'UPDATE books SET available_quantity = available_quantity + 1 WHERE id = $1',
                [transaction.book_id]
            );

            // Commit transaction
            await query('COMMIT');

            res.status(200).json({
                success: true,
                message: 'Book returned successfully.',
                data: updatedTransaction.rows[0],
            });
        } catch (error) {
            // Rollback on error
            await query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Get transaction history (all transactions)
 * GET /api/transactions/history
 */
const getTransactionHistory = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status; // Optional filter
        const offset = (page - 1) * limit;

        let queryText = `
      SELECT 
        t.*,
        u.name as user_name,
        u.email as user_email,
        b.title as book_title,
        b.author as book_author
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      JOIN books b ON t.book_id = b.id
    `;
        let countText = 'SELECT COUNT(*) FROM transactions';
        const params = [];

        // Add status filter if provided
        if (status && (status === 'ISSUED' || status === 'RETURNED')) {
            queryText += ' WHERE t.status = $1';
            countText += ' WHERE status = $1';
            params.push(status);
        }

        // Add ordering and pagination
        const transactionsQueryText = queryText + ' ORDER BY t.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        const transactionsParams = [...params, limit, offset];

        const [transactionsResult, countResult] = await Promise.all([
            query(transactionsQueryText, transactionsParams),
            query(countText, params)
        ]);

        const totalTransactions = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalTransactions / limit);

        // Compute fines for response
        const virtualDate = req.headers['x-virtual-date'];
        const transactions = transactionsResult.rows.map(t => {
            const fine_amount = calculateFine(t.due_date, t.status, t.return_date, virtualDate);
            return { ...t, fine_amount };
        });

        res.status(200).json({
            success: true,
            data: {
                transactions,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalTransactions,
                    limit,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user's own transactions
 * GET /api/transactions/user
 */
const getUserTransactions = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const status = req.query.status; // Optional filter
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        let queryText = `
      SELECT 
        t.*,
        b.title as book_title,
        b.author as book_author,
        b.isbn as book_isbn
      FROM transactions t
      JOIN books b ON t.book_id = b.id
      WHERE t.user_id = $1
    `;
        let countText = 'SELECT COUNT(*) FROM transactions WHERE user_id = $1';
        const params = [user_id];

        // Add status filter if provided
        if (status && (status === 'ISSUED' || status === 'RETURNED')) {
            queryText += ' AND t.status = $2';
            countText += ' AND status = $2';
            params.push(status);
        }

        // Add ordering and pagination
        const transactionsQueryText = queryText + ' ORDER BY t.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        const transactionsParams = [...params, limit, offset];

        const [transactionsResult, countResult] = await Promise.all([
            query(transactionsQueryText, transactionsParams),
            query(countText, params)
        ]);

        const totalTransactions = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalTransactions / limit);

        // Compute fines for response
        const virtualDate = req.headers['x-virtual-date'];
        const transactions = transactionsResult.rows.map(t => {
            const fine_amount = calculateFine(t.due_date, t.status, t.return_date, virtualDate);
            return { ...t, fine_amount };
        });

        res.status(200).json({
            success: true,
            data: {
                transactions,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalTransactions,
                    limit,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    issueBook,
    returnBook,
    getTransactionHistory,
    getUserTransactions,
};
