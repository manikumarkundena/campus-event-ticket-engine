import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Valid email address required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['STUDENT', 'ORGANIZER', 'ADMIN', 'GATE_STAFF']).optional().default('STUDENT'),
  department: z.string().optional(),
  usn: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email address required'),
  password: z.string().min(1, 'Password is required'),
});

export const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['TECHNICAL', 'CULTURAL', 'SPORTS', 'WORKSHOP', 'HACKATHON']),
  venue: z.string().min(2, 'Venue is required'),
  startDateTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start date time',
  }),
  endDateTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid end date time',
  }),
  totalCapacity: z.number().int().positive('Capacity must be at least 1'),
  bannerUrl: z.string().optional(),
});

export const updateEventSchema = createEventSchema.partial().extend({
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']).optional(),
});

export const createBookingSchema = z.object({
  eventId: z.string().uuid('Valid event ID required'),
});

export const verifyTicketSchema = z.object({
  ticketIdentifier: z.string().min(3, 'Ticket code or QR payload token required'),
  entryNotes: z.string().optional(),
});
