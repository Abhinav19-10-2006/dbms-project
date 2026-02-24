// User model
export interface User {
    id: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'STUDENT';
    created_at?: string;
}

// Book model
export interface Book {
    id: number;
    title: string;
    authorid?: number;
    author: string;
    isbn: string;
    category: string;
    quantity: number;
    available_quantity: number;
    created_at?: string;
}

// Transaction model
export interface Transaction {
    id: number;
    user_id: number;
    book_id: number;
    issue_date: string;
    due_date: string;
    return_date?: string;
    status: 'ISSUED' | 'RETURNED';
    created_at?: string;
    // Joined fields
    user_name?: string;
    user_email?: string;
    book_title?: string;
    book_author?: string;
    book_isbn?: string;
    fine_amount?: number;
}

// API Response models
export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

export interface BooksResponse {
    success: boolean;
    data: {
        books: Book[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalBooks: number;
            limit: number;
        };
    };
}

export interface TransactionsResponse {
    success: boolean;
    data: {
        transactions: Transaction[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalTransactions: number;
            limit: number;
        };
    };
}

// Auth models
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    role?: 'ADMIN' | 'STUDENT';
}

export interface AuthResponse {
    user: User;
    token: string;
}
