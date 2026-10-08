import prisma from '../utils/prisma';
import { logAudit } from '../utils/audit';

export interface ValidationResponse {
  result: 'VALID' | 'ALREADY_USED' | 'CANCELLED' | 'EXPIRED' | 'INVALID';
  message: string;
  ticket?: {
    id: string;
    ticketCode: string;
    status: string;
    validatedAt?: Date | null;
    validatedBy?: string | null;
  };
  event?: {
    id: string;
    title: string;
    venue: string;
    startDateTime: Date;
  };
  attendee?: {
    name: string;
    department?: string | null;
    usn?: string | null;
  };
}

export async function validateTicket(
  ticketIdentifier: string,
  staffUserId: string,
  entryNotes?: string,
  ipAddress?: string
): Promise<ValidationResponse> {
  const cleanIdentifier = ticketIdentifier.trim();

  // Find ticket by either ticketCode or qrPayload
  const ticket = await prisma.ticket.findFirst({
    where: {
      OR: [
        { ticketCode: cleanIdentifier },
        { qrPayload: cleanIdentifier },
      ],
    },
    include: {
      booking: {
        include: {
          user: {
            select: { name: true, department: true, usn: true },
          },
          event: true,
        },
      },
      validatedBy: {
        select: { name: true },
      },
    },
  });

  if (!ticket) {
    await logAudit({
      action: 'TICKET_VALIDATION_FAILED',
      entityType: 'TICKET',
      userId: staffUserId,
      metadata: { attemptedIdentifier: cleanIdentifier, reason: 'TICKET_NOT_FOUND' },
      ipAddress,
    });

    return {
      result: 'INVALID',
      message: 'Ticket not found in system database. Check QR code or code entry.',
    };
  }

  const { booking } = ticket;
  const { event, user: attendee } = booking;

  // Check 1: Event status
  if (event.status === 'CANCELLED') {
    return {
      result: 'CANCELLED',
      message: `Event "${event.title}" was cancelled by the organizers.`,
      ticket: {
        id: ticket.id,
        ticketCode: ticket.ticketCode,
        status: 'CANCELLED',
      },
      event: {
        id: event.id,
        title: event.title,
        venue: event.venue,
        startDateTime: event.startDateTime,
      },
      attendee,
    };
  }

  // Check 2: Booking status
  if (booking.status === 'CANCELLED' || ticket.status === 'CANCELLED') {
    return {
      result: 'CANCELLED',
      message: 'This booking has been cancelled and cannot be used for entry.',
      ticket: {
        id: ticket.id,
        ticketCode: ticket.ticketCode,
        status: 'CANCELLED',
      },
      event: {
        id: event.id,
        title: event.title,
        venue: event.venue,
        startDateTime: event.startDateTime,
      },
      attendee,
    };
  }

  // Check 3: Already Used
  if (ticket.status === 'USED') {
    await logAudit({
      action: 'TICKET_DUPLICATE_ENTRY_ATTEMPT',
      entityType: 'TICKET',
      entityId: ticket.id,
      userId: staffUserId,
      metadata: {
        ticketCode: ticket.ticketCode,
        previouslyValidatedAt: ticket.validatedAt,
        previouslyValidatedBy: ticket.validatedBy?.name,
      },
      ipAddress,
    });

    return {
      result: 'ALREADY_USED',
      message: `Duplicate entry blocked! This ticket was already verified at ${ticket.validatedAt ? new Date(ticket.validatedAt).toLocaleTimeString() : 'earlier'}${ticket.validatedBy ? ` by ${ticket.validatedBy.name}` : ''}.`,
      ticket: {
        id: ticket.id,
        ticketCode: ticket.ticketCode,
        status: 'USED',
        validatedAt: ticket.validatedAt,
        validatedBy: ticket.validatedBy?.name,
      },
      event: {
        id: event.id,
        title: event.title,
        venue: event.venue,
        startDateTime: event.startDateTime,
      },
      attendee,
    };
  }

  // Check 4: VALID Ticket - Record entry atomically
  const now = new Date();
  const updatedTicket = await prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      status: 'USED',
      validatedAt: now,
      validatedById: staffUserId,
      entryNotes: entryNotes || 'Verified at gate',
    },
    include: {
      validatedBy: { select: { name: true } },
    },
  });

  await logAudit({
    action: 'TICKET_VALIDATED_SUCCESS',
    entityType: 'TICKET',
    entityId: ticket.id,
    userId: staffUserId,
    metadata: {
      ticketCode: ticket.ticketCode,
      attendeeName: attendee.name,
      eventTitle: event.title,
      entryTime: now.toISOString(),
    },
    ipAddress,
  });

  return {
    result: 'VALID',
    message: `Entry approved! Welcome ${attendee.name}.`,
    ticket: {
      id: updatedTicket.id,
      ticketCode: updatedTicket.ticketCode,
      status: 'USED',
      validatedAt: updatedTicket.validatedAt,
      validatedBy: updatedTicket.validatedBy?.name,
    },
    event: {
      id: event.id,
      title: event.title,
      venue: event.venue,
      startDateTime: event.startDateTime,
    },
    attendee,
  };
}

export async function getGateRecentValidations(limit = 20) {
  const recent = await prisma.ticket.findMany({
    where: { status: 'USED' },
    include: {
      booking: {
        include: {
          user: { select: { name: true, department: true, usn: true } },
          event: { select: { title: true, venue: true } },
        },
      },
      validatedBy: { select: { name: true } },
    },
    orderBy: { validatedAt: 'desc' },
    take: limit,
  });

  return recent;
}
