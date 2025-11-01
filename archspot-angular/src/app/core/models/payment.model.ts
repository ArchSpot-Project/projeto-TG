export type PaymentMethod = 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BOLETO' | 'CHECK' | 'CASH';
export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELED';

export interface InstallmentRequest {
  projectId: number;
  amount: number;
  estimatedPaymentDate: string;
  paymentStatus?: PaymentStatus;
  description?: string | null;
  paymentMethod?: PaymentMethod | null;
  realPaymentDate?: string | null;
}

export interface InstallmentResponse {
  id: number;
  estimatedPaymentDate: string;
  realPaymentDate: string | null;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  amount: number;
  description?: string | null;
  projectId: number;
}