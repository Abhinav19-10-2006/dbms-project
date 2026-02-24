import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { DateSimulationService } from '../services/date-simulation.service';

/**
 * HTTP Interceptor to attach JWT token to requests and handle 401 errors
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const dateSimService = inject(DateSimulationService);
    const router = inject(Router);

    // Get token from auth service
    const token = authService.getToken();
    const virtualDate = dateSimService.getVirtualDate();

    // Clone request and add headers
    let headers: any = {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (virtualDate) {
        headers['x-virtual-date'] = virtualDate;
    }

    if (Object.keys(headers).length > 0) {
        req = req.clone({
            setHeaders: headers
        });
    }

    // Handle response and catch 401 errors
    return next(req).pipe(
        catchError((error) => {
            if (error.status === 401) {
                // Token expired or invalid, logout user
                authService.logout();
                router.navigate(['/login']);
            }
            return throwError(() => error);
        })
    );
};
