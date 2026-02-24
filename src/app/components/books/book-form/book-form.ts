import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BookService } from '../../../services/book.service';
import { Book } from '../../../models/models';

@Component({
  selector: 'app-book-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './book-form.html',
  styleUrl: './book-form.css',
})
export class BookForm {
  bookForm: FormGroup;
  loading = signal(false);
  mode: 'add' | 'edit';

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<BookForm>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'add' | 'edit'; book?: Book }
  ) {
    this.mode = data.mode;

    this.bookForm = this.fb.group({
      title: [data.book?.title || '', [Validators.required]],
      authorid: [data.book?.authorid || '', [Validators.required]],
      author: [data.book?.author || '', [Validators.required]],
      isbn: [data.book?.isbn || '', [Validators.required]],
      category: [data.book?.category || '', [Validators.required]],
      quantity: [data.book?.quantity || 0, [Validators.required, Validators.min(0)]],
    });
  }

  onSubmit(): void {
    if (this.bookForm.invalid) {
      return;
    }

    this.loading.set(true);
    const bookData = this.bookForm.value;

    const request =
      this.mode === 'add'
        ? this.bookService.createBook(bookData)
        : this.bookService.updateBook(this.data.book!.id, bookData);

    request.subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          const message = this.mode === 'add' ? 'Book added successfully' : 'Book updated successfully';
          this.snackBar.open(message, 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        }
      },
      error: (error) => {
        this.loading.set(false);
        const message = error.error?.message || 'Operation failed';
        this.snackBar.open(message, 'Close', { duration: 5000 });
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
