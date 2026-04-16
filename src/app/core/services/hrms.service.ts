import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  ApiMessageResponse,
  CompOffPayload,
  DashboardData,
  DocumentRecord,
  EmployeeDirectory,
  EmployeeLeaveReport,
  EmployeeProfile,
  GrievancePayload,
  LeaveRequestPayload,
  PerformanceEvaluation,
  ReferralPayload,
  ResignationPayload,
  Vacancy
} from '../../models/hrms.model';

@Injectable({ providedIn: 'root' })
export class HrmsService {
  private readonly apiService = inject(ApiService);

  getDashboardData(): Observable<DashboardData> {
    return this.apiService.get<DashboardData>('/api/hrms/dashboard');
  }

  getReferralOpenings(): Observable<Vacancy[]> {
    return this.apiService.get<Vacancy[]>('/api/hrms/utilities/referral-openings');
  }

  submitLeave(payload: LeaveRequestPayload): Observable<ApiMessageResponse> {
    return this.apiService.post<ApiMessageResponse>('/api/hrms/utilities/leave', payload);
  }

  submitCompOff(payload: CompOffPayload): Observable<ApiMessageResponse> {
    return this.apiService.post<ApiMessageResponse>('/api/hrms/utilities/comp-off', payload);
  }

  submitReferral(payload: ReferralPayload): Observable<ApiMessageResponse> {
    return this.apiService.post<ApiMessageResponse>('/api/hrms/utilities/referral', payload);
  }

  submitGrievance(payload: GrievancePayload): Observable<ApiMessageResponse> {
    return this.apiService.post<ApiMessageResponse>('/api/hrms/utilities/grievance', payload);
  }

  submitResignation(payload: ResignationPayload): Observable<ApiMessageResponse> {
    return this.apiService.post<ApiMessageResponse>('/api/hrms/utilities/resignation', payload);
  }

  getContactDirectory(search = ''): Observable<EmployeeDirectory[]> {
    return this.apiService.get<EmployeeDirectory[]>(`/api/hrms/reports/contact-directory?search=${encodeURIComponent(search)}`);
  }

  getEmployeesOnLeave(): Observable<EmployeeLeaveReport[]> {
    return this.apiService.get<EmployeeLeaveReport[]>('/api/hrms/reports/employees-on-leave');
  }

  getDocuments(fromDate?: string, toDate?: string, documentType?: string): Observable<DocumentRecord[]> {
    const queryParts: string[] = [];

    if (fromDate) {
      queryParts.push(`fromDate=${encodeURIComponent(fromDate)}`);
    }

    if (toDate) {
      queryParts.push(`toDate=${encodeURIComponent(toDate)}`);
    }

    if (documentType) {
      queryParts.push(`documentType=${encodeURIComponent(documentType)}`);
    }

    const query = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return this.apiService.get<DocumentRecord[]>(`/api/hrms/reports/documents${query}`);
  }

  getPerformanceEvaluations(employeeName?: string): Observable<PerformanceEvaluation[]> {
    const query = employeeName ? `?employeeName=${encodeURIComponent(employeeName)}` : '';
    return this.apiService.get<PerformanceEvaluation[]>(`/api/hrms/reports/performance-evaluation${query}`);
  }

  getMyProfile(): Observable<EmployeeProfile> {
    return this.apiService.get<EmployeeProfile>('/api/hrms/profile/me');
  }
}
