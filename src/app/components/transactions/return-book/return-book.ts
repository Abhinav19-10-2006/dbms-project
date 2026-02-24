import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TransactionService } from '../../../services/transaction.service';
import { Transaction } from '../../../models/models';

@Component({
  selector: 'app-return-book',
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './return-book.html',
  styleUrl: './return-book.css',
})
export class ReturnBook implements OnInit {
  issuedBooks = signal<Transaction[]>([]);
  loading = signal(false);
  displayedColumns: string[] = ['book_title', 'issue_date', 'due_date', 'actions'];

  constructor(
    private transactionService: TransactionService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadIssuedBooks();
  }

  loadIssuedBooks(): void {
    this.loading.set(true);
    this.transactionService.getUserTransactions('ISSUED', 1, 100).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success && response.data.transactions) {
          this.issuedBooks.set(response.data.transactions);
        }
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  returnBook(transaction: Transaction): void {
    this.transactionService.returnBook(transaction.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Book returned successfully!', 'Close', { duration: 3000 });
          this.loadIssuedBooks();
        }
      },
      error: (error) => {
        const message = error.error?.message || 'Failed to return book';
        this.snackBar.open(message, 'Close', { duration: 5000 });
      },
    });
  }
}
