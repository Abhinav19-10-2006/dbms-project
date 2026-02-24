import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TransactionService } from '../../../services/transaction.service';
import { AuthService } from '../../../services/auth.service';
import { Transaction } from '../../../models/models';

@Component({
  selector: 'app-transaction-history',
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './transaction-history.html',
  styleUrl: './transaction-history.css',
})
export class TransactionHistory implements OnInit {
  transactions = signal<Transaction[]>([]);
  loading = signal(false);
  currentPage = 1;
  pageSize = 10;
  totalTransactions = 0;

  isAdmin = computed(() => this.authService.isAdmin());

  displayedColumns = computed(() => {
    const columns = ['book_title'];
    if (this.isAdmin()) {
      columns.push('user_name');
    }
    columns.push('issue_date', 'due_date', 'return_date', 'fine_amount', 'status');
    if (!this.isAdmin()) {
      columns.push('actions');
    }
    return columns;
  });

  constructor(
    private transactionService: TransactionService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading.set(true);

    const apiCall = this.isAdmin()
      ? this.transactionService.getTransactionHistory(this.currentPage, this.pageSize)
      : this.transactionService.getUserTransactions(undefined, this.currentPage, this.pageSize);

    apiCall.subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success && response.data.transactions) {
          this.transactions.set(response.data.transactions);
          this.totalTransactions = response.data.pagination.totalTransactions || 0;
        }
      },
      error: () => this.loading.set(false),
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadTransactions();
  }

  returnBook(transaction: Transaction): void {
    this.loading.set(true);
    this.transactionService.returnBook(transaction.id).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.snackBar.open(`Successfully returned "${transaction.book_title}"`, 'Close', { duration: 3000 });
        this.loadTransactions();
      },
      error: (error) => {
        this.loading.set(false);
        const message = error.error?.message || 'Failed to return book';
        this.snackBar.open(message, 'Close', { duration: 5000 });
      }
    });
  }
}
