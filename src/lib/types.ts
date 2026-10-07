// src/lib/types.ts

export type Gender = 'M' | 'F' | 'Other';
export type Status = 'active' | 'inactive';
export type BusStatus = 'active' | 'maintenance' | 'inactive';
export type PassengerType = 'student' | 'staff';
export type SeatStatus = 'available' | 'assigned' | 'reserved' | 'blocked';
export type SeatLayoutType = '2x2' | '2x3' | '3x2' | 'custom';

export interface Organization {
  id: string;
  name: string;
  code: string;
  contactEmail?: string;
  academicYear?: string;
}

export interface Stop {
  id: string;
  name: string;
  landmark: string;
  pickupTime: string;
  dropTime: string;
  order: number;
}

export interface Route {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
  isActive: boolean;
  stops: Stop[];
}

export interface Seat {
  id: string;
  seatNumber: string; // e.g., "01", "02", "17"
  row: number;
  column: number;
  status: SeatStatus;
  passengerId?: string; // Passenger currently assigned
}

export interface SeatLayout {
  layoutType: SeatLayoutType;
  rows: number;
  seats: Seat[];
}

export interface Bus {
  id: string;
  busNumber: string; // e.g., "BUS-01"
  registrationNumber: string; // e.g., "AP16 AB 1234"
  name: string; // e.g., "Amaravati Express"
  capacity: number;
  status: BusStatus;
  routeId?: string;
  seatLayout: SeatLayout;
  isActive: boolean;
}

export interface Student {
  id: string;
  studentId: string; // e.g., "24CSE1032"
  name: string;
  gender: Gender;
  course: string; // e.g., "B.Tech"
  branch: string; // e.g., "CSE", "ECE", "IT", "MECH"
  year: number; // 1 to 4
  phone: string;
  parentName: string;
  parentPhone: string;
  status: Status;
}

export interface Staff {
  id: string;
  employeeId: string; // e.g., "EMP204"
  name: string;
  gender: Gender;
  department: string; // e.g., "Computer Science", "Physics", "Admin"
  designation: string; // e.g., "Associate Professor", "Lab Incharge"
  phone: string;
  status: Status;
}

export interface Assignment {
  id: string;
  passengerId: string;
  passengerType: PassengerType;
  busId: string;
  routeId: string;
  seatId: string;
  pickupStopId: string;
  dropStopId: string;
  status: 'active' | 'revoked';
  assignedAt: string;
}

export interface SearchResultItem {
  id: string;
  type: 'passenger' | 'bus' | 'route' | 'stop';
  title: string;
  subtitle: string;
  secondaryInfo?: string;
  link: string;
}

