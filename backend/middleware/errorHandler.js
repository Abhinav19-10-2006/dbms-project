/**
 * Global error handling middleware
 * Catches all errors and sends appropriate JSON response
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Default error
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // PostgreSQL specific errors
    if (err.code) {
        switch (err.code) {
            case '23505': // Unique violation
                statusCode = 409;
                message = 'Resource already exists. Please check unique fields.';
                break;
            case '23503': // Foreign key violation
                statusCode = 400;
                message = 'Invalid reference. Related resource does not exist.';
                break;
            case '23502': // Not null violation
                statusCode = 400;
                message = 'Required field is missing.';
                break;
            case '22P02': // Invalid text representation
                statusCode = 400;
                message = 'Invalid data format.';
                break;
            default:
                message = 'Database error occurred.';
        }
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

module.exports = errorHandler;
