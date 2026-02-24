import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { Login } from './components/auth/login/login';
import { Register } from './components/auth/register/register';
import { Dashboard } from './components/dashboard/dashboard';
import { BookList } from './components/books/book-list/book-list';
import { IssueBook } from './components/transactions/issue-book/issue-book';
import { ReturnBook } from './components/transactions/return-book/return-book';
import { TransactionHistory } from './components/transactions/transaction-history/transaction-history';
import { UserList } from './components/users/user-list/user-list';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'admin/login', component: Login },
    { path: 'register', component: Register },
    {
        path: 'dashboard',
        component: Dashboard,
        canActivate: [authGuard],
    },
    {
        path: 'books',
        component: BookList,
        canActivate: [authGuard],
    },
    {
        path: 'transactions/issue',
        component: IssueBook,
        canActivate: [authGuard],
    },
    {
        path: 'transactions/return',
        component: ReturnBook,
        canActivate: [authGuard],
    },
    {
        path: 'transactions/history',
        component: TransactionHistory,
        canActivate: [authGuard],
    },
    {
        path: 'users',
        component: UserList,
        canActivate: [authGuard, roleGuard],
    },
    { path: '**', redirectTo: '/login' },
];
