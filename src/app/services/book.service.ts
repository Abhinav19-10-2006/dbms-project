import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Book, ApiResponse, BooksResponse } from '../models/models';

@Injectable({
    providedIn: 'root',
})
export class BookService {
    private readonly API_URL = `${environment.apiUrl}/books`;

    constructor(private http: HttpClient) { }

    /**
     * Get all books with pagination and search
     */
    getAllBooks(
        page: number = 1,
        limit: number = 10,
        search: string = ''
    ): Observable<BooksResponse> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        if (search) {
            params = params.set('search', search);
        }

        return this.http.get<BooksResponse>(this.API_URL, { params });
    }

    /**
     * Get single book by ID
     */
    getBookById(id: number): Observable<ApiResponse<Book>> {
        return this.http.get<ApiResponse<Book>>(`${this.API_URL}/${id}`);
    }

    /**
     * Create new book (Admin only)
     */
    createBook(book: Partial<Book>): Observable<ApiResponse<Book>> {
        return this.http.post<ApiResponse<Book>>(this.API_URL, book);
    }

    /**
     * Update book (Admin only)
     */
    updateBook(id: number, book: Partial<Book>): Observable<ApiResponse<Book>> {
        return this.http.put<ApiResponse<Book>>(`${this.API_URL}/${id}`, book);
    }

    /**
     * Delete book (Admin only)
     */
    deleteBook(id: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
    }

    /**
     * Get dashboard statistics
     */
    getStats(): Observable<ApiResponse<any>> {
        return this.http.get<ApiResponse<any>>(`${this.API_URL}/stats`);
    }
}
