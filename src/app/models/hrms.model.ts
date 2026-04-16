export interface HrmsEvent {
  id: number;
  title: string;
  description?: string;
  eventDate: string;
}

export interface EmployeeOfMonth {
  name: string;
  department: string;
  rating: number;
}

export interface Vacancy {
  id: number;
  position: string;
  location: string;
  experience: string;
}

export interface EmployeeLeaveReport {
  name: string;
  email: string;
  designation: string;
  fromDate: string;
  toDate: string;
  leaveType: string;
  reportingManager: string;
}

export interface DashboardData {
  events: HrmsEvent[];
  employeeOfMonth?: EmployeeOfMonth;
  vacancies: Vacancy[];
  newJoinees: string[];
  employeesOnLeave: EmployeeLeaveReport[];
  birthdays: string[];
}

export interface LeaveRequestPayload {
  leaveType: string;
  fromDate: string;
  toDate: string;
  description?: string;
  leaveDurationType: string;
}

export interface CompOffPayload {
  earnedDate: string;
  inTime?: string | null;
  outTime?: string | null;
  usedWith: string;
  clientName: string;
  category: string;
  description?: string;
}

export interface ReferralPayload {
  position: string;
  candidateName: string;
  contact: string;
  cvFileName?: string;
}

export interface GrievancePayload {
  incidentDate: string;
  incidentTime?: string | null;
  location: string;
  complaintAgainst: string;
  description: string;
  witnesses?: string;
}

export interface ResignationPayload {
  resignationDate: string;
  lastWorkingDate: string;
  reason: string;
}

export interface ApiMessageResponse {
  success: boolean;
  message: string;
}

export interface EmployeeDirectory {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  phone?: string;
  designation: string;
  department: string;
  managerName?: string;
}

export interface DocumentRecord {
  id: number;
  documentType: string;
  fileName: string;
  fileUrl?: string;
  uploadedAt: string;
}

export interface PerformanceEvaluation {
  id: number;
  employeeName: string;
  month: number;
  year: number;
  rating: number;
  selfComments?: string;
  reviewerComments?: string;
}

export interface EmployeeProfile {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  phone?: string;
  designation: string;
  department: string;
  bloodGroup?: string;
  dateOfBirth?: string;
  joinDate?: string;
  managerName?: string;
}
