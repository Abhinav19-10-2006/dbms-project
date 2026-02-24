import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { Navbar } from './components/shared/navbar/navbar';
import { Sidebar } from './components/shared/sidebar/sidebar';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, Navbar, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor(
    public authService: AuthService,
    public router: Router
  ) { }

  isFullPage(): boolean {
    const fullPages = ['/login', '/admin/login', '/register'];
    return fullPages.includes(this.router.url);
  }
}
