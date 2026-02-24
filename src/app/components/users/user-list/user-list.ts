import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/models';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserList implements OnInit {
  users = signal<User[]>([]);
  loading = signal(false);
  displayedColumns: string[] = ['name', 'email', 'role', 'created_at', 'actions'];

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success && response.data) {
          this.users.set(response.data);
        }
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: (response) => {
          this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: (error) => {
          const message = error.error?.message || 'Failed to delete user';
          this.snackBar.open(message, 'Close', { duration: 5000 });
        },
      });
    }
  }
}
