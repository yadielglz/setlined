// Core data types for SetLined

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'rep' | 'manager' | 'admin';
  locationId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Location {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
  managerId?: string;
  createdAt?: Date;
}

export interface Customer {
   id: string;
   firstName: string;
   lastName: string;
   email?: string;
   phone?: string;
   dateOfBirth?: Date;
   address?: {
     street: string;
     city: string;
     state: string;
     zipCode: string;
   };
   customerType: 'new' | 'existing' | 'loyalty';
   loyaltyPoints: number;
   totalPurchases: number;
   lastVisitDate?: Date;
   createdBy: string;
   locationId?: string;
   createdAt?: Date;
   updatedAt?: Date;
}

export interface Employee {
   id: string;
   firstName: string;
   lastName: string;
   email: string;
   phone?: string;
   employeeId: string;
   position: string;
   department: string;
   hireDate: Date;
   salary?: number;
   status: 'active' | 'inactive' | 'on-leave';
   managerId?: string;
   locationId?: string;
   createdAt?: Date;
   updatedAt?: Date;
}

export interface Interaction {
   id: string;
   customerId: string;
   assignedTo: string;
   status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
   source: 'walk-in' | 'phone' | 'website' | 'referral';
   priority: 'low' | 'medium' | 'high';
   estimatedValue: number;
   notes?: string;
   nextFollowUp?: Date;
   locationId?: string;
   createdAt?: Date;
   updatedAt?: Date;
   // Interaction types checkboxes
   tLife: boolean;
   upgrade: boolean;
   newSale: boolean;
   appointment: boolean;
}

export interface Appointment {
  id: string;
  customerId?: string;
  leadId?: string;
  assignedTo: string;
  appointmentType: 'follow-up' | 'consultation' | 'sale';
  title: string;
  description?: string;
  scheduledDate: Date;
  durationMinutes: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  location?: string;
  notes?: string;
  locationId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Communication {
  id: string;
  customerId?: string;
  leadId?: string;
  userId: string;
  type: 'call' | 'email' | 'text' | 'in-person';
  direction: 'inbound' | 'outbound';
  subject?: string;
  content?: string;
  durationMinutes?: number;
  locationId?: string;
  createdAt?: Date;
}

// Form types for creating/editing
export interface CustomerForm {
   firstName: string;
   lastName: string;
   email?: string;
   phone?: string;
   dateOfBirth?: string;
   address?: {
     street: string;
     city: string;
     state: string;
     zipCode: string;
   };
   customerType: 'new' | 'existing' | 'loyalty';
}

export interface EmployeeForm {
   firstName: string;
   lastName: string;
   email: string;
   phone?: string;
   employeeId: string;
   position: string;
   department: string;
   hireDate: string;
   salary?: number;
   status: 'active' | 'inactive' | 'on-leave';
   managerId?: string;
}

export interface InteractionForm {
   customerId: string;
   assignedTo: string;
   status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
   source: 'walk-in' | 'phone' | 'website' | 'referral';
   priority: 'low' | 'medium' | 'high';
   estimatedValue: number;
   notes?: string;
   nextFollowUp?: string;
   // Interaction types checkboxes
   tLife: boolean;
   upgrade: boolean;
   newSale: boolean;
   appointment: boolean;
}

export interface AppointmentForm {
   customerId?: string;
   leadId?: string;
   assignedTo?: string;
   appointmentType: 'follow-up' | 'consultation' | 'sale';
   title: string;
   description?: string;
   scheduledDate: string;
   durationMinutes: number;
   status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
   location?: string;
   notes?: string;
}

// Dashboard metrics
export interface DashboardMetrics {
  totalCustomers: number;
  activeLeads: number;
  upcomingAppointments: number;
  conversionRate: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'lead_created' | 'customer_added' | 'appointment_scheduled' | 'lead_converted';
  title: string;
  description: string;
  timestamp: Date;
  userId: string;
  userName: string;
}

// Filter and search types
export interface CustomerFilters {
  search?: string;
  customerType?: 'new' | 'existing' | 'loyalty';
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface InteractionFilters {
   search?: string;
   status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
   priority?: 'low' | 'medium' | 'high';
   assignedTo?: string;
   dateRange?: {
     start: Date;
     end: Date;
   };
}

export interface AppointmentFilters {
  search?: string;
  status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  assignedTo?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}