export interface Customer {
  id?: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: Date | string;
  gender: string;
  email: string;
  phoneNumber: string;
  alternatePhoneNumber?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  identificationType: string;
  identificationNumber: string;
  customerType: string;
  annualIncome: number;
  employmentStatus: string;
  isKYCVerified?: boolean;
  kycVerifiedDate?: Date | string;
  isActive?: boolean;
}

export interface CreateCustomerDto {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phoneNumber: string;
  alternatePhoneNumber?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  identificationType: string;
  identificationNumber: string;
  customerType: string;
  annualIncome: number;
  employmentStatus: string;
}