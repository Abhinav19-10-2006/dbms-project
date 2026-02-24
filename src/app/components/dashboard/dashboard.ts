import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BookService } from '../../services/book.service';
import { TransactionService } from '../../services/transaction.service';
import { AuthService } from '../../services/auth.service';
import { Transaction } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  totalBooks = signal(0);
  issuedBooks = signal(0);
  availableBooks = signal(0);
  totalFines = signal(0);
  recentTransactions = signal<Transaction[]>([]);
  dueSoonBooks = signal<Transaction[]>([]);
  loading = signal(true);

  isAdmin = computed(() => this.authService.isAdmin());

  displayedColumns = computed(() => {
    const columns = ['book_title'];
    if (this.isAdmin()) {
      columns.push('user_name');
    }
    columns.push('issue_date', 'due_date', 'status', 'fine_amount');
    return columns;
  });

  constructor(
    private bookService: BookService,
    private transactionService: TransactionService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading.set(true);

    // Load statistics from the new optimized endpoint
    this.bookService.getStats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const stats = response.data;
          this.totalBooks.set(stats.totalBooks);
          this.availableBooks.set(stats.availableBooks);
          this.issuedBooks.set(stats.issuedBooks);
          this.totalFines.set(stats.totalFines);
        }
      },
      error: () => this.loading.set(false),
    });

    if (this.isAdmin()) {
      // Admin: Load global transactions (recent 5)
      this.transactionService.getTransactionHistory(1, 5).subscribe({
        next: (response) => {
          this.loading.set(false);
          if (response.success && response.data.transactions) {
            this.recentTransactions.set(response.data.transactions);
          }
        },
        error: () => this.loading.set(false),
      });
    } else {
      // Student: Load personal transactions and reminders
      this.transactionService.getUserTransactions('ISSUED', 1, 100).subscribe({
        next: (response) => {
          if (response.success && response.data.transactions) {
            // Identify due soon (within 2 days) or overdue
            const today = new Date();
            const twoDaysFromNow = new Date();
            twoDaysFromNow.setDate(today.getDate() + 2);

            const reminders = response.data.transactions.filter(t => {
              const dueDate = new Date(t.due_date);
              return dueDate <= twoDaysFromNow;
            });
            this.dueSoonBooks.set(reminders);
          }
        }
      });

      this.transactionService.getUserTransactions(undefined, 1, 5).subscribe({
        next: (response) => {
          this.loading.set(false);
          if (response.success && response.data.transactions) {
            this.recentTransactions.set(response.data.transactions);
          }
        },
        error: () => this.loading.set(false),
      });
    }
  }
}
