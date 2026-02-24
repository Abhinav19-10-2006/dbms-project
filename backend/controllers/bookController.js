const { query } = require('../config/db');

/**
 * Get all books with pagination and search
 * GET /api/books?page=1&limit=10&search=query
 */
const getAllBooks = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        let queryText = 'SELECT * FROM books';
        let countText = 'SELECT COUNT(*) FROM books';
        const params = [];

        // Add search filter if provided
        if (search) {
            queryText += ' WHERE title ILIKE $1 OR author ILIKE $1 OR category ILIKE $1';
            countText += ' WHERE title ILIKE $1 OR author ILIKE $1 OR category ILIKE $1';
            params.push(`%${search}%`);
        }

        // Add ordering and pagination
        queryText += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        params.push(limit, offset);

        // Get books
        const booksResult = await query(queryText, params);

        // Get total count
        const countResult = await query(countText, search ? [`%${search}%`] : []);
        const totalBooks = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalBooks / limit);

        res.status(200).json({
            success: true,
            data: {
                books: booksResult.rows,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalBooks,
                    limit,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single book by ID
 * GET /api/books/:id
 */
const getBookById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await query('SELECT * FROM books WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Book not found.',
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create new book (Admin only)
 * POST /api/books
 */
const createBook = async (req, res, next) => {
    try {
        const { title, authorid, author, isbn, category, quantity } = req.body;

        // Validation
        if (!title || !authorid || !author || !isbn || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Please provide title, authorid, author, ISBN, and quantity.',
            });
        }

        // Insert book
        const result = await query(
            'INSERT INTO books (title, authorid, author, isbn, category, quantity, available_quantity) VALUES ($1, $2, $3, $4, $5, $6, $6) RETURNING *',
            [title, parseInt(authorid), author, isbn, category || 'General', parseInt(quantity)]
        );

        res.status(201).json({
            success: true,
            message: 'Book created successfully.',
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update book (Admin only)
 * PUT /api/books/:id
 */
const updateBook = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, authorid, author, isbn, category, quantity } = req.body;

        // Check if book exists
        const existingBook = await query('SELECT * FROM books WHERE id = $1', [id]);

        if (existingBook.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Book not found.',
            });
        }

        const book = existingBook.rows[0];

        // Calculate new available quantity if total quantity changes
        let newAvailableQuantity = book.available_quantity;
        if (quantity !== undefined) {
            const difference = parseInt(quantity) - book.quantity;
            newAvailableQuantity = book.available_quantity + difference;

            // Ensure available quantity doesn't go negative
            if (newAvailableQuantity < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot reduce quantity below issued books count.',
                });
            }
        }

        // Update book
        const result = await query(
            'UPDATE books SET title = $1, authorid = $2, author = $3, isbn = $4, category = $5, quantity = $6, available_quantity = $7 WHERE id = $8 RETURNING *',
            [
                title || book.title,
                authorid !== undefined ? parseInt(authorid) : book.authorid,
                author || book.author,
                isbn || book.isbn,
                category || book.category,
                quantity !== undefined ? parseInt(quantity) : book.quantity,
                newAvailableQuantity,
                id,
            ]
        );

        res.status(200).json({
            success: true,
            message: 'Book updated successfully.',
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete book (Admin only)
 * DELETE /api/books/:id
 */
const deleteBook = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if book has active transactions
        const activeTransactions = await query(
            'SELECT COUNT(*) FROM transactions WHERE book_id = $1 AND status = $2',
            [id, 'ISSUED']
        );

        if (parseInt(activeTransactions.rows[0].count) > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete book with active issued transactions.',
            });
        }

        // Delete book
        const result = await query('DELETE FROM books WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Book not found.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Book deleted successfully.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get dashboard statistics
 * GET /api/books/stats
 */
const getStats = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const isAdmin = req.user.role === 'ADMIN';

        // Get book stats
        const bookStatsResult = await query(`
            SELECT 
                SUM(quantity) as total_quantity,
                SUM(available_quantity) as total_available
            FROM books
        `);

        const bookStats = bookStatsResult.rows[0];
        const totalBooksCount = parseInt(bookStats.total_quantity) || 0;
        const totalAvailableCount = parseInt(bookStats.total_available) || 0;
        const totalIssuedCount = totalBooksCount - totalAvailableCount;

        // Get fine stats
        let totalFines = 0;
        const { calculateFine } = require('../utils/transactionUtils');
        const virtualDate = req.headers['x-virtual-date'];

        if (isAdmin) {
            const transactionsResult = await query('SELECT due_date, status, return_date FROM transactions');
            totalFines = transactionsResult.rows.reduce((sum, t) => sum + calculateFine(t.due_date, t.status, t.return_date, virtualDate), 0);
        } else {
            const transactionsResult = await query('SELECT due_date, status, return_date FROM transactions WHERE user_id = $1', [userId]);
            totalFines = transactionsResult.rows.reduce((sum, t) => sum + calculateFine(t.due_date, t.status, t.return_date, virtualDate), 0);
        }

        // Get personal issued count if student
        let personalIssuedCount = 0;
        if (!isAdmin) {
            const personalResult = await query('SELECT COUNT(*) FROM transactions WHERE user_id = $1 AND status = $2', [userId, 'ISSUED']);
            personalIssuedCount = parseInt(personalResult.rows[0].count) || 0;
        }

        res.status(200).json({
            success: true,
            data: {
                totalBooks: totalBooksCount,
                availableBooks: totalAvailableCount,
                issuedBooks: isAdmin ? totalIssuedCount : personalIssuedCount,
                totalFines: totalFines,
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    getStats,
};
