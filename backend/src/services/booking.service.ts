import { v4 as uuidv4 } from 'uuid';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { logAudit } from '../utils/audit';

export async function createBooking(userId: string, eventId: string, ipAddress?: string) {
  // Execute capacity-safe atomic transaction
  const result = await prisma.$transaction(async (tx) => {
    // 1. Verify user does not already have an active booking (application check)
    const existing = await tx.booking.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (existing && existing.status === 'CONFIRMED') {
      throw new AppError('You have already reserved a ticket for this event', 409);
    }

    // 2. Fetch and verify event status
    const event = await tx.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    if (event.status !== 'PUBLISHED') {
      throw new AppError(`Event is currently ${event.status.toLowerCase()} and cannot be booked`, 400);
    }

    if (new Date(event.endDateTime) < new Date()) {
      throw new AppError('Event has already concluded', 400);
    }

    // 3. ATOMIC CAPACITY RESERVATION
    // Conditional update guarantees atomic reservation without race conditions.
    // If availableCapacity == 0, updateResult.count will be 0 and transaction will rollback.
    const capacityUpdate = await tx.event.updateMany({
      where: {
        id: eventId,
        availableCapacity: { gt: 0 },
        status: 'PUBLISHED',
      },
      data: {
        availableCapacity: { decrement: 1 },
      },
    });

    if (capacityUpdate.count === 0) {
      throw new AppError('Event has reached maximum capacity. No remaining tickets.', 409);
    }

    // 4. Create Booking record
    const bookingReference = `BK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const booking = await tx.booking.create({
      data: {
        bookingReference,
        userId,
        eventId,
        status: 'CONFIRMED',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, usn: true, department: true },
        },
      },
    });

    // 5. Generate secure digital ticket with unique verification code and opaque QR payload
    const ticketCode = `TKT-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const qrPayload = `TKT_PASS_${uuidv4().replace(/-/g, '')}`;

    const ticket = await tx.ticket.create({
      data: {
        ticketCode,
        qrPayload,
        bookingId: booking.id,
        status: 'VALID',
      },
    });

    return { booking, ticket, event };
  });

  // 6. Record audit log outside transaction
  await logAudit({
    action: 'BOOKING_CREATE',
    entityType: 'BOOKING',
    entityId: result.booking.id,
    userId,
    metadata: {
      eventId,
      eventTitle: result.event.title,
      ticketCode: result.ticket.ticketCode,
      bookingReference: result.booking.bookingReference,
    },
    ipAddress,
  });

  return {
    booking: result.booking,
    ticket: result.ticket,
    event: {
      id: result.event.id,
      title: result.event.title,
      venue: result.event.venue,
      startDateTime: result.event.startDateTime,
      endDateTime: result.event.endDateTime,
      category: result.event.category,
    },
  };
}

export async function getUserBookings(userId: string) {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          venue: true,
          startDateTime: true,
          endDateTime: true,
          category: true,
          status: true,
          bannerUrl: true,
        },
      },
      ticket: {
        select: {
          id: true,
          ticketCode: true,
          qrPayload: true,
          status: true,
          validatedAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return bookings;
}

export async function getBookingById(bookingId: string, userId: string, role: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: {
        select: { id: true, name: true, email: true, usn: true, department: true },
      },
      event: true,
      ticket: true,
    },
  });

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  if (role !== 'ADMIN' && booking.userId !== userId && booking.event.organizerId !== userId) {
    throw new AppError('Unauthorized access to booking details', 403);
  }

  return booking;
}

export async function cancelBooking(bookingId: string, userId: string, role: string, ipAddress?: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { event: true, ticket: true },
  });

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  if (role !== 'ADMIN' && booking.userId !== userId) {
    throw new AppError('Unauthorized to cancel this booking', 403);
  }

  if (booking.status === 'CANCELLED') {
    throw new AppError('Booking is already cancelled', 400);
  }

  if (booking.ticket && booking.ticket.status === 'USED') {
    throw new AppError('Cannot cancel a ticket that has already been validated and used for entry', 400);
  }

  // Atomically cancel booking, invalidate ticket, and increment availableCapacity
  const updated = await prisma.$transaction(async (tx) => {
    const b = await tx.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    });

    if (booking.ticket) {
      await tx.ticket.update({
        where: { id: booking.ticket.id },
        data: { status: 'CANCELLED' },
      });
    }

    // Restore capacity back to event
    await tx.event.update({
      where: { id: booking.eventId },
      data: {
        availableCapacity: { increment: 1 },
      },
    });

    return b;
  });

  await logAudit({
    action: 'BOOKING_CANCEL',
    entityType: 'BOOKING',
    entityId: bookingId,
    userId,
    metadata: { eventId: booking.eventId },
    ipAddress,
  });

  return updated;
}
