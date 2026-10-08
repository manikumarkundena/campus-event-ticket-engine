export type UserRole = 'STUDENT' | 'ORGANIZER' | 'ADMIN' | 'GATE_STAFF';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string | null;
  usn?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
}

export type EventCategory = 'TECHNICAL' | 'CULTURAL' | 'SPORTS' | 'WORKSHOP' | 'HACKATHON';
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  venue: string;
  startDateTime: string;
  endDateTime: string;
  totalCapacity: number;
  availableCapacity: number;
  status: EventStatus;
  bannerUrl?: string | null;
  organizerId: string;
  organizer?: {
    id: string;
    name: string;
    department?: string | null;
  };
  _count?: {
    bookings: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 'CONFIRMED' | 'CANCELLED';
export type TicketStatus = 'VALID' | 'USED' | 'CANCELLED';

export interface Ticket {
  id: string;
  ticketCode: string;
  qrPayload: string;
  status: TicketStatus;
  validatedAt?: string | null;
  entryNotes?: string | null;
  validatedBy?: {
    name: string;
  } | null;
  createdAt: string;
}

export interface Booking {
  id: string;
  bookingReference: string;
  userId: string;
  eventId: string;
  status: BookingStatus;
  event: CampusEvent;
  ticket?: Ticket | null;
  user?: User;
  createdAt: string;
}

export interface ValidationResult {
  result: 'VALID' | 'ALREADY_USED' | 'CANCELLED' | 'EXPIRED' | 'INVALID';
  message: string;
  ticket?: {
    id: string;
    ticketCode: string;
    status: string;
    validatedAt?: string | null;
    validatedBy?: string | null;
  };
  event?: {
    id: string;
    title: string;
    venue: string;
    startDateTime: string;
  };
  attendee?: {
    name: string;
    department?: string | null;
    usn?: string | null;
  };
}

export interface OrganizerMetrics {
  totalEvents: number;
  upcomingEvents: number;
  totalBookings: number;
  totalCapacity: number;
  totalValidatedTickets: number;
  validationRate: number;
  capacityFillRate: number;
  eventsSummary: Array<{
    id: string;
    title: string;
    category: string;
    venue: string;
    status: string;
    startDateTime: string;
    totalCapacity: number;
    availableCapacity: number;
    bookedCount: number;
    validatedCount: number;
  }>;
}

export interface AuditLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  userId?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  metadata?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}
