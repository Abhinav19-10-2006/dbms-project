import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Transaction, ApiResponse, TransactionsResponse } from '../models/models';

@Injectable({
    providedIn: 'root',
})
export class TransactionService {
    private readonly API_URL = `${environment.apiUrl}/transactions`;

    constructor(private http: HttpClient) { }

    /**
     * Issue a book
     */
    issueBook(bookId: number, dueDate?: string): Observable<ApiResponse<Transaction>> {
        return this.http.post<ApiResponse<Transaction>>(`${this.API_URL}/issue`, {
            book_id: bookId,
            due_date: dueDate,
        });
    }

    /**
     * Return a book
     */
    returnBook(transactionId: number): Observable<ApiResponse<Transaction>> {
        return this.http.post<ApiResponse<Transaction>>(`${this.API_URL}/return`, {
            transaction_id: transactionId,
        });
    }

    /**
     * Get transaction history (all transactions)
     */
    getTransactionHistory(page: number = 1, limit: number = 10): Observable<TransactionsResponse> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        return this.http.get<TransactionsResponse>(`${this.API_URL}/history`, { params });
    }

    /**
     * Get user's own transactions
     */
    getUserTransactions(
        status?: 'ISSUED' | 'RETURNED',
        page: number = 1,
        limit: number = 10
    ): Observable<TransactionsResponse> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        if (status) {
            params = params.set('status', status);
        }

        return this.http.get<TransactionsResponse>(`${this.API_URL}/user`, { params });
    }
}
