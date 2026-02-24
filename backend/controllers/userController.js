const { query } = require('../config/db');

/**
 * Get all users (Admin only)
 * GET /api/users
 */
const getAllUsers = async (req, res, next) => {
    try {
        const result = await query(
            'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
        );

        res.status(200).json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete user (Admin only)
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Prevent admin from deleting themselves
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account.',
            });
        }

        // Check if user has active transactions
        const activeTransactions = await query(
            'SELECT COUNT(*) FROM transactions WHERE user_id = $1 AND status = $2',
            [id, 'ISSUED']
        );

        if (parseInt(activeTransactions.rows[0].count) > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete user with active issued books. Please return all books first.',
            });
        }

        // Delete user (CASCADE will delete their transaction history)
        const result = await query('DELETE FROM users WHERE id = $1 RETURNING id, name, email', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'User deleted successfully.',
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllUsers,
    deleteUser,
};
