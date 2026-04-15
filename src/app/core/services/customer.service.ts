import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Customer, CreateCustomerDto } from '../../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private endpoint = '/api/Customer';

  constructor(private apiService: ApiService) { }

  getAllCustomers(): Observable<Customer[]> {
    return this.apiService.get<Customer[]>(this.endpoint);
  }

  getCustomerById(id: number): Observable<Customer> {
    return this.apiService.get<Customer>(`${this.endpoint}/${id}`);
  }

  createCustomer(customer: CreateCustomerDto): Observable<Customer> {
    return this.apiService.post<Customer>(this.endpoint, customer);
  }

  updateCustomer(id: number, customer: CreateCustomerDto): Observable<Customer> {
    return this.apiService.put<Customer>(`${this.endpoint}/${id}`, customer);
  }

  deleteCustomer(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }
}