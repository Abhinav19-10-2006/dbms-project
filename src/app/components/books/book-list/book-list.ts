import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../../services/book.service';
import { AuthService } from '../../../services/auth.service';
import { Book } from '../../../models/models';
import { BookForm } from '../book-form/book-form';
import { TransactionService } from '../../../services/transaction.service';

@Component({
  selector: 'app-book-list',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './book-list.html',
  styleUrl: './book-list.css',
})
export class BookList implements OnInit {
  books = signal<Book[]>([]);
  loading = signal(false);
  searchQuery = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalBooks = 0;

  userTransactions = signal<any[]>([]);
  displayedColumns: string[] = ['title', 'author', 'isbn', 'category', 'quantity', 'available_quantity', 'actions'];

  constructor(
    private bookService: BookService,
    private transactionService: TransactionService,
    public authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadBooks();
    if (!this.authService.isAdmin()) {
      this.loadUserTransactions();
    }
  }

  loadUserTransactions(): void {
    this.transactionService.getUserTransactions('ISSUED', 1, 100).subscribe({
      next: (response) => {
        if (response.success && response.data.transactions) {
          this.userTransactions.set(response.data.transactions);
        }
      },
      error: () => {
        console.error('Failed to load user transactions');
      }
    });
  }

  loadBooks(): void {
    this.loading.set(true);
    this.bookService.getAllBooks(this.currentPage, this.pageSize, this.searchQuery).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success && response.data.books) {
          this.books.set(response.data.books);
          this.totalBooks = response.data.pagination.totalBooks || 0;
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.snackBar.open('Failed to load books', 'Close', { duration: 3000 });
      },
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadBooks();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadBooks();
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(BookForm, {
      width: '600px',
      data: { mode: 'add' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadBooks();
      }
    });
  }

  openEditDialog(book: Book): void {
    const dialogRef = this.dialog.open(BookForm, {
      width: '600px',
      data: { mode: 'edit', book },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadBooks();
      }
    });
  }

  deleteBook(book: Book): void {
    if (confirm(`Are you sure you want to delete "${book.title}"?`)) {
      this.bookService.deleteBook(book.id).subscribe({
        next: (response) => {
          this.snackBar.open('Book deleted successfully', 'Close', { duration: 3000 });
          this.loadBooks();
        },
        error: (error) => {
          const message = error.error?.message || 'Failed to delete book';
          this.snackBar.open(message, 'Close', { duration: 5000 });
        },
      });
    }
  }

  isBookIssued(bookId: number): boolean {
    return this.userTransactions().some(t => t.book_id === bookId);
  }

  getTransactionForBook(bookId: number): any {
    return this.userTransactions().find(t => t.book_id === bookId);
  }

  rentBook(book: Book): void {
    if (book.available_quantity <= 0) {
      this.snackBar.open('Book is currently out of stock', 'Close', { duration: 3000 });
      return;
    }

    this.loading.set(true);

    this.transactionService.issueBook(book.id).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.snackBar.open(`Successfully rented "${book.title}"`, 'Close', { duration: 3000 });
        this.loadBooks();
        this.loadUserTransactions();
      },
      error: (error) => {
        this.loading.set(false);
        const message = error.error?.message || 'Failed to rent book';
        this.snackBar.open(message, 'Close', { duration: 5000 });
      }
    });
  }

  returnBook(book: Book): void {
    const transaction = this.getTransactionForBook(book.id);
    if (!transaction) return;

    this.loading.set(true);
    this.transactionService.returnBook(transaction.id).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.snackBar.open(`Successfully returned "${book.title}"`, 'Close', { duration: 3000 });
        this.loadBooks();
        this.loadUserTransactions();
      },
      error: (error) => {
        this.loading.set(false);
        const message = error.error?.message || 'Failed to return book';
        this.snackBar.open(message, 'Close', { duration: 5000 });
      }
    });
  }
}
