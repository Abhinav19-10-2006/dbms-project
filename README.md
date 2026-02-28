# Library Management System - Project Report

## Project Overview

This is a full-stack **Library Management System** built with **Angular (Frontend)** and **Node.js/Express (Backend)** with a **PostgreSQL database**. The system enables efficient management of library operations including book inventory, user management, and transaction tracking (book issuance and returns).

**Domain**: DBMS (Database Management System)  
**Topic**: Library Management System  
**Stack**: Angular 17+ | Express.js | PostgreSQL | Material Design

---

## System Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Angular 17+ | Single-page application with responsive UI |
| **Backend** | Node.js + Express.js | RESTful API server |
| **Database** | PostgreSQL | Relational data persistence |
| **UI Framework** | Angular Material | Modern, accessible UI components |
| **Authentication** | JWT (JSON Web Tokens) | Secure user authentication |

---

## Database Schema

### Core Tables

#### 1. **users**
Stores user information with role-based access control.

```sql
- id (PK): SERIAL
- name: VARCHAR
- email: VARCHAR (UNIQUE)
- password: VARCHAR (hashed)
- role: VARCHAR (ADMIN | STUDENT)
- created_at: TIMESTAMP
```

#### 2. **books**
Manages book inventory and availability.

```sql
- id (PK): SERIAL
- title: VARCHAR
- author: VARCHAR
- isbn: VARCHAR (UNIQUE)
- category: VARCHAR
- quantity: INTEGER (total copies)
- available_quantity: INTEGER (current available)
- created_at: TIMESTAMP
```

#### 3. **transactions**
Records all book issue and return activities.

```sql
- id (PK): SERIAL
- user_id (FK): INTEGER → users(id)
- book_id (FK): INTEGER → books(id)
- issue_date: DATE
- due_date: DATE
- return_date: DATE (nullable, set only when returned)
- status: VARCHAR (ISSUED | RETURNED)
- created_at: TIMESTAMP
```

### Key Indexes
- `idx_transactions_user_id` — Fast lookup by user
- `idx_transactions_book_id` — Fast lookup by book
- `idx_transactions_status` — Filter by transaction status

---

## Core Features

### 1. Authentication & Authorization
- **Login/Register**: User account creation and authentication via JWT tokens
- **Role-Based Access Control**: 
  - **Admin**: Full access to all books, users, and transactions
  - **Student**: Can only issue/return books and view personal transactions
- **Auth Guard**: Route protection ensuring only authorized users access specific pages
- **Auth Interceptor**: Automatically attaches JWT tokens to API requests

### 2. Book Management
- **Book Listing**: Browse all available books with search/filter capabilities
- **Book Add/Edit**: Admins can add new books and update existing book information
- **Inventory Tracking**: Automatic quantity management (decreases on issue, increases on return)
- **Category Organization**: Books organized by category for easy navigation

### 3. Transaction Management

#### Issue Book
- Students can issue available books
- Automatic due date assignment (default: 14 days from issue date)
- Inventory quantity automatically decreases
- Transaction status: **ISSUED**

#### Return Book
- Students can return issued books
- Fine calculation based on overdue days ($5/day)
- Inventory quantity automatically increases
- Transaction status: **RETURNED**

#### Transaction History
- **All Transactions**: Admins view global transaction history
- **Personal Transactions**: Students see only their own transactions
- **Pagination**: View transactions in chunks (10 per page default)
- **Fine Tracking**: Automatic fine calculation and display

### 4. Dashboard
- **Statistics Cards**:
  - Total Book Types (admin only)
  - Issued Books / My Issued Books
  - Available Books in Library
  - Total Fines
- **Critical Reminders** (Students): Books due within 2 days or overdue
- **Recent Transactions Table**: Shows 5 most recent transactions
- **Role-Based Display**: Different views for admins vs. students

### 5. User Management (Admin Only)
- View all registered users
- Manage user information
- Track user transaction history

---

## Project Structure

```
libraryproject/
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── components/
│       │   │   ├── auth/          → Login & Register pages
│       │   │   ├── books/         → Book listing & forms
│       │   │   ├── dashboard/     → Main dashboard
│       │   │   ├── transactions/  → Issue, return, history
│       │   │   ├── users/         → User management
│       │   │   └── shared/        → Navbar, sidebar components
│       │   ├── services/
│       │   │   ├── auth.service.ts
│       │   │   ├── book.service.ts
│       │   │   ├── transaction.service.ts
│       │   │   └── user.service.ts
│       │   ├── guards/            → Route protection
│       │   └── interceptors/      → HTTP request/response handling
│       └── environments/          → Configuration files
│
├── backend/
│   ├── server.js                  → Express server entry point
│   ├── config/
│   │   └── db.js                  → Database connection
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bookRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── userRoutes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookController.js
│   │   ├── transactionController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js                → JWT verification
│   │   └── errorHandler.js
│   └── utils/
│       └── transactionUtils.js    → Fine calculation logic
│
└── database/
    ├── schema.sql                 → Table definitions
    └── seed.sql                   → Sample data
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` — Create new user account
- `POST /api/auth/login` — Authenticate user, return JWT token

### Books
- `GET /api/books` — Get all books (paginated)
- `GET /api/books/available` — Get books with available quantity > 0
- `POST /api/books` — Create new book (admin only)
- `PUT /api/books/:id` — Update book details (admin only)
- `DELETE /api/books/:id` — Delete book (admin only)
- `GET /api/books/stats` — Get library statistics

### Transactions
- `POST /api/transactions/issue` — Issue a book to user
- `POST /api/transactions/return` — Return an issued book
- `GET /api/transactions/history` — Get all transactions (admin only, paginated)
- `GET /api/transactions/user` — Get user's own transactions (paginated)

### Users
- `GET /api/users` — Get all users (admin only, paginated)
- `GET /api/users/profile` — Get current user profile
- `PUT /api/users/:id` — Update user details (admin only)

---

## Key Business Logic

### Fine Calculation
- **Rate**: $5 per day overdue
- **Trigger**: Calculated when `return_date > due_date`
- **Implementation**: Backend utility function calculates on each transaction query
- **Display**: Fine amount shown in transaction history and dashboard

### Inventory Management
- **Issue Book**: `available_quantity--`
- **Return Book**: `available_quantity++`
- **Atomic Operations**: Database transactions ensure consistency

### Role-Based Views
- **Admin**: See all data, manage books & users, view global transactions
- **Student**: See only personal books issued, personal transactions, personal profile

---

## Data Flow Example: Issue Book Transaction

```
1. Student navigates to "Issue Book" page
   ↓
2. Selects available book and due date from form
   ↓
3. Frontend calls: POST /api/transactions/issue
   ↓
4. Backend (issueBook controller):
   - Verify user is authenticated
   - Check book exists and available_quantity > 0
   - Create transaction record (status='ISSUED')
   - Decrement book.available_quantity
   ↓
5. Database:
   - INSERT into transactions table
   - UPDATE books SET available_quantity = available_quantity - 1
   ↓
6. Response to frontend with transaction details
   ↓
7. Dashboard auto-refreshes, showing new transaction
```

---

## Setup & Installation

### Frontend Setup
```bash
cd libraryproject
npm install
npm start
```
Runs on: `http://localhost:4200`

### Backend Setup
```bash
cd backend
npm install
npm start
```
Runs on: `http://localhost:5001`

### Database Setup
```bash
psql -U postgres -d library_db -f database/schema.sql
psql -U postgres -d library_db -f database/seed.sql
```

---

## Testing

### Unit Tests
```bash
npm test
```

### Manual Testing Flow
1. Register a new student account
2. Login as admin, add books to library
3. Login as student, issue a book
4. Check dashboard for new transaction
5. Return the book and verify fine calculation (if overdue)
6. Check transaction history for completed transaction

---

## Future Enhancements

- Email notifications for due/overdue books
- Book reservations system
- Advanced search & filtering
- Renewal of issued books
- Analytics dashboard
- SMS notifications
- Mobile app version

---

## Conclusion

This Library Management System demonstrates a complete full-stack application with proper separation of concerns, role-based access control, and real-world business logic implementation. The relational database design ensures data integrity, while the Angular frontend provides a responsive user experience.
