import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import {
    User,
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    ApiResponse,
} from '../models/models';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly API_URL = environment.apiUrl;
    private readonly TOKEN_KEY = 'library_token';
    private readonly USER_KEY = 'library_user';

    // Signals for reactive state management
    private currentUserSignal = signal<User | null>(this.getUserFromStorage());
    private isAuthenticatedSignal = signal<boolean>(this.hasToken());

    // Public computed signals
    public currentUser = this.currentUserSignal.asReadonly();
    public isAuthenticated = this.isAuthenticatedSignal.asReadonly();
    public isAdmin = computed(() => this.currentUserSignal()?.role === 'ADMIN');

    constructor(
        private http: HttpClient,
        private router: Router
    ) { }

    /**
     * Register a new user
     */
    register(data: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
        return this.http
            .post<ApiResponse<AuthResponse>>(`${this.API_URL}/auth/register`, data)
            .pipe(
                tap((response) => {
                    if (response.success && response.data) {
                        this.setSession(response.data);
                    }
                })
            );
    }

    /**
     * Login user
     */
    login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
        return this.http
            .post<ApiResponse<AuthResponse>>(`${this.API_URL}/auth/login`, credentials)
            .pipe(
                tap((response) => {
                    if (response.success && response.data) {
                        this.setSession(response.data);
                    }
                })
            );
    }

    /**
     * Logout user
     */
    logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.currentUserSignal.set(null);
        this.isAuthenticatedSignal.set(false);
        this.router.navigate(['/login']);
    }

    /**
     * Get JWT token
     */
    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Check if user has token
     */
    private hasToken(): boolean {
        return !!this.getToken();
    }

    /**
     * Set user session
     */
    private setSession(authResponse: AuthResponse): void {
        localStorage.setItem(this.TOKEN_KEY, authResponse.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(authResponse.user));
        this.currentUserSignal.set(authResponse.user);
        this.isAuthenticatedSignal.set(true);
    }

    /**
     * Get user from localStorage
     */
    private getUserFromStorage(): User | null {
        const userStr = localStorage.getItem(this.USER_KEY);
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }
        return null;
    }

    /**
     * Check if current user is admin
     */
    isUserAdmin(): boolean {
        return this.currentUserSignal()?.role === 'ADMIN';
    }
}
