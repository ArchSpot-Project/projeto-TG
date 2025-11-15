export interface FinancialGeneralRowDTO {
projectId: number;
projectName: string;
status: string;
totalValue: number;
totalPaid: number;
totalRemaining: number;
}


export interface FinancialProjectRowDTO {
installmentId: number;
description: string;
status: string;
value: number;
paymentMethod: string;
estimatedPaymentDate: string | null;
realPaymentDate: string | null;
}


export interface ScheduleGeneralRowDTO {
projectId: number;
projectName: string;
status: string;
percentComplete: number;
percentPaid: number;
estimatedStartDate: string | null;
estimatedEndDate: string | null;
realStartDate: string | null;
realEndDate: string | null;
}


export interface ScheduleProjectRowDTO {
phaseId: number;
phaseName: string;
status: string;
percentComplete: number;
estimatedStartDate: string | null;
estimatedEndDate: string | null;
realStartDate: string | null;
realEndDate: string | null;
}