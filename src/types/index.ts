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

// App User Management (Firebase Auth users)
export interface AppUser {
    uid: string;
    email: string;
    displayName: string;
    role: 'rep' | 'manager' | 'admin';
    locationId?: string;
    isActive: boolean;
    emailVerified: boolean;
    lastSignIn?: Date;
    createdAt: Date;
    updatedAt?: Date;
}

export interface AppUserForm {
    email: string;
    displayName: string;
    role: 'rep' | 'manager' | 'admin';
    locationId?: string;
    isActive: boolean;
    password?: string; // Only for creation
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
   interactionId?: string;
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
    interactionId?: string;
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

// Scheduling Employee Types (separate from user management)
export interface SchedulingEmployee {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  position: string;
  department: string;
  locationId?: string;
  isActive: boolean;
  hireDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SchedulingEmployeeForm {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  position: string;
  department: string;
  locationId?: string;
  isActive: boolean;
  hireDate: string;
}

// Employee Schedule Types
export interface ScheduleEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  date: Date;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  shiftType: 'morning' | 'afternoon' | 'evening' | 'night' | 'custom';
  locationId?: string;
  notes?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleForm {
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  shiftType: 'morning' | 'afternoon' | 'evening' | 'night' | 'custom';
  locationId?: string;
  notes?: string;
  isActive: boolean;
}

export interface ScheduleFilters {
  employeeId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  shiftType?: 'morning' | 'afternoon' | 'evening' | 'night' | 'custom';
  locationId?: string;
}

// Schedule display types for tabs
export interface DailySchedule {
  date: Date;
  entries: ScheduleEntry[];
  totalEmployees: number;
  activeShifts: number;
}

export interface WeeklySchedule {
  weekStart: Date;
  weekEnd: Date;
  dailySchedules: DailySchedule[];
}

// Store Performance Metrics
export interface StorePerformanceMetrics {
  id: string;
  date: Date;
  voiceLines: number; // Voice Lines (qty)
  bts: number; // BTS (qty)
  t4b: number; // T4B (qty)
  acc: number; // Acc (dollar amount)
  hint: number; // HINT (qty)
  locationId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StorePerformanceForm {
  date: string;
  voiceLines: number;
  bts: number;
  t4b: number;
  acc: number;
  hint: number;
}