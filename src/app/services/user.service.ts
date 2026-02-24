import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, ApiResponse } from '../models/models';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private readonly API_URL = `${environment.apiUrl}/users`;

    constructor(private http: HttpClient) { }

    /**
     * Get all users (Admin only)
     */
    getAllUsers(): Observable<ApiResponse<User[]>> {
        return this.http.get<ApiResponse<User[]>>(this.API_URL);
    }

    /**
     * Delete user (Admin only)
     */
    deleteUser(id: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
    }
}
