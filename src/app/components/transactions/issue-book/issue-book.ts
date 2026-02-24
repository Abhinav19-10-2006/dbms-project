import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BookService } from '../../../services/book.service';
import { TransactionService } from '../../../services/transaction.service';
import { Book } from '../../../models/models';

@Component({
  selector: 'app-issue-book',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './issue-book.html',
  styleUrl: './issue-book.css',
})
export class IssueBook implements OnInit {
  issueForm: FormGroup;
  availableBooks = signal<Book[]>([]);
  loading = signal(false);

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private transactionService: TransactionService,
    private snackBar: MatSnackBar
  ) {
    this.issueForm = this.fb.group({
      book_id: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadAvailableBooks();
  }

  loadAvailableBooks(): void {
    this.bookService.getAllBooks(1, 1000).subscribe({
      next: (response) => {
        if (response.success && response.data.books) {
          this.availableBooks.set(response.data.books.filter((b) => b.available_quantity > 0));
        }
      },
    });
  }

  onSubmit(): void {
    if (this.issueForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.transactionService.issueBook(this.issueForm.value.book_id).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          this.snackBar.open('Book issued successfully!', 'Close', { duration: 3000 });
          this.issueForm.reset();
          this.loadAvailableBooks();
        }
      },
      error: (error) => {
        this.loading.set(false);
        const message = error.error?.message || 'Failed to issue book';
        this.snackBar.open(message, 'Close', { duration: 5000 });
      },
    });
  }
}
