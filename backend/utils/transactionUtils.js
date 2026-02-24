/**
 * Calculate fine amount based on due date and status
 * @param {string} dueDateStr - ISO date string or date object
 * @param {string} status - 'ISSUED' or 'RETURNED'
 * @param {string} returnDateStr - ISO date string or date object (if status is RETURNED)
 * @param {string} optNow - Optional virtual "current" date
 * @returns {number} - Calculated fine amount
 */
const calculateFine = (dueDateStr, status, returnDateStr = null, optNow = null) => {
    const dueDate = new Date(dueDateStr);

    // Use return date if returned, otherwise use optNow or real current date
    let comparisonDate;
    if (status === 'RETURNED' && returnDateStr) {
        comparisonDate = new Date(returnDateStr);
    } else {
        comparisonDate = optNow ? new Date(optNow) : new Date();
    }

    // Reset time for fair day-based calculation
    dueDate.setHours(0, 0, 0, 0);
    comparisonDate.setHours(0, 0, 0, 0);

    if (comparisonDate > dueDate) {
        const diffTime = Math.abs(comparisonDate - dueDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays * 5; // $5 per day
    }

    return 0;
};

module.exports = {
    calculateFine,
};
