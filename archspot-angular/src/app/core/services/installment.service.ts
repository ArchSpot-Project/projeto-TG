// core/services/installment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InstallmentRequest, InstallmentResponse, PaymentMethod } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class InstallmentService {
  private apiUrl = 'http://localhost:8080/installments';

  constructor(private http: HttpClient) { }

  createInstallment(dto: InstallmentRequest): Observable<InstallmentResponse> {
    return this.http.post<InstallmentResponse>(this.apiUrl, dto);
  }

  updateInstallment(id: number, data: Partial<InstallmentResponse>) {
    return this.http.put<InstallmentResponse>(`${this.apiUrl}/${id}`, data);
  }

  deleteInstallment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  findInstallmentById(id: number): Observable<InstallmentResponse> {
    return this.http.get<InstallmentResponse>(`${this.apiUrl}/${id}`);
  }

  findAll(): Observable<InstallmentResponse[]> {
    return this.http.get<InstallmentResponse[]>(this.apiUrl);
  }

  payInstallment(id: number, method: PaymentMethod): Observable<InstallmentResponse> {
    const params = new HttpParams().set('method', method);
    return this.http.patch<InstallmentResponse>(`${this.apiUrl}/${id}/pay`, null, { params });
  }

  cancelInstallment(id: number) {
    return this.http.patch<InstallmentResponse>(`${this.apiUrl}/${id}/cancel`, {});
  }

  getPaymentStatus(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/payment-status`);
  }

  getPaymentMethods(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/payment-methods`);
  }
}
