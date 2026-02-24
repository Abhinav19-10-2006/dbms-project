# Library Management System - Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **PostgreSQL** (v14 or higher)
- **Angular CLI** (v20 or higher)

## 🗄️ Database Setup

### 1. Install PostgreSQL

If you don't have PostgreSQL installed:

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

```bash
# Access PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE library_db;

# Exit psql
\q
```

### 3. Run Database Schema

```bash
cd /Users/abhinavkeshav/libraryproject
psql -U postgres -d library_db -f database/schema.sql
```

### 4. (Optional) Load Seed Data

```bash
psql -U postgres -d library_db -f database/seed.sql
```

**Note:** The seed data includes demo users with placeholder passwords. After starting the backend, you should register new users through the API or frontend.

## 🔧 Backend Setup

### 1. Install Dependencies

```bash
cd /Users/abhinavkeshav/libraryproject/backend
npm install
```

### 2. Configure Environment

Edit `backend/.env` and update the database credentials if needed:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=library_db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

### 3. Start Backend Server

```bash
# Development mode with auto-reload
npm run dev

# OR production mode
npm start
```

The backend will run on **http://localhost:5001**

## 🎨 Frontend Setup

### 1. Install Dependencies

Dependencies are already installed, but if needed:

```bash
cd /Users/abhinavkeshav/libraryproject
npm install
```

### 2. Start Frontend

```bash
npm start
```

The frontend will run on **http://localhost:4200**

## 🚀 Quick Start

### Option 1: Start Both Servers

**Terminal 1 (Backend):**
```bash
cd /Users/abhinavkeshav/libraryproject/backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd /Users/abhinavkeshav/libraryproject
npm start
```

### Option 2: Use Demo Credentials

After loading seed data, you can login with:

**Admin Account:**
- Email: `admin@library.com`
- Password: `admin123`

**Student Account:**
- Email: `john@student.com`
- Password: `student123`

**Note:** These passwords need to be properly hashed. It's recommended to register new users through the registration page.

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Books (Requires Authentication)
- `GET /api/books` - Get all books (with pagination & search)
- `GET /api/books/:id` - Get single book
- `POST /api/books` - Create book (Admin only)
- `PUT /api/books/:id` - Update book (Admin only)
- `DELETE /api/books/:id` - Delete book (Admin only)

### Transactions (Requires Authentication)
- `POST /api/transactions/issue` - Issue a book
- `POST /api/transactions/return` - Return a book
- `GET /api/transactions/history` - Get all transactions
- `GET /api/transactions/user` - Get user's transactions

### Users (Admin Only)
- `GET /api/users` - Get all users
- `DELETE /api/users/:id` - Delete user

## 🧪 Testing the Application

### 1. Register a New User

Navigate to http://localhost:4200/register and create an account.

### 2. Login

Use your credentials to login at http://localhost:4200/login

### 3. Test Features

- **Dashboard**: View statistics and recent transactions
- **Books**: Browse, search, and manage books (admin can add/edit/delete)
- **Issue Book**: Issue a book to yourself
- **Return Book**: Return issued books
- **Transaction History**: View all transactions
- **Users** (Admin only): Manage users

## 🔍 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
pg_isready

# Check database exists
psql -U postgres -l | grep library_db
```

### Backend Port Already in Use

```bash
# Find process using port 5000
lsof -ti:5000

# Kill the process
kill -9 $(lsof -ti:5000)
```

### Frontend Port Already in Use

```bash
# Angular will automatically suggest a different port
# Or manually specify port:
ng serve --port 4201
```

## 📦 Project Structure

```
libraryproject/
├── backend/                 # Node.js/Express backend
│   ├── config/             # Database configuration
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Auth & error handling
│   ├── routes/             # API routes
│   ├── .env                # Environment variables
│   ├── package.json
│   └── server.js           # Entry point
├── database/               # SQL scripts
│   ├── schema.sql          # Database schema
│   └── seed.sql            # Sample data
├── src/                    # Angular frontend
│   ├── app/
│   │   ├── components/     # UI components
│   │   ├── services/       # API services
│   │   ├── guards/         # Route guards
│   │   ├── interceptors/   # HTTP interceptors
│   │   └── models/         # TypeScript interfaces
│   └── environments/       # Environment configs
└── README.md
```

## 🎯 Features Implemented

✅ JWT-based authentication
✅ Role-based authorization (Admin/Student)
✅ Book CRUD operations
✅ Issue/Return book functionality
✅ Transaction history
✅ User management (Admin)
✅ Search and pagination
✅ Responsive Material UI design
✅ Form validation
✅ Error handling

## 📄 License

This project is for educational purposes.
