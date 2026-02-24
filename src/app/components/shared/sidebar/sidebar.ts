import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { AuthService } from '../../../services/auth.service';
import { DateSimulationService } from '../../../services/date-simulation.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatListModule,
    MatIconModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  simulatedDate: Date;

  constructor(
    public authService: AuthService,
    private dateSimService: DateSimulationService
  ) {
    this.simulatedDate = this.dateSimService.getVirtualDateAsDate();
  }

  onDateChange(event: any): void {
    this.dateSimService.setVirtualDate(event.value);
    // Reload current page to see new fines
    window.location.reload();
  }

  logout(): void {
    this.authService.logout();
  }
}
