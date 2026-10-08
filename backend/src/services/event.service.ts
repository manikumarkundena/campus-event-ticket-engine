import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { logAudit } from '../utils/audit';

export interface CreateEventDTO {
  title: string;
  description: string;
  category: string;
  venue: string;
  startDateTime: string;
  endDateTime: string;
  totalCapacity: number;
  bannerUrl?: string;
}

export interface UpdateEventDTO extends Partial<CreateEventDTO> {
  status?: string;
}

export interface EventFilterQuery {
  search?: string;
  category?: string;
  status?: string;
  upcomingOnly?: boolean;
  page?: number;
  limit?: number;
}

export async function createEvent(data: CreateEventDTO, organizerId: string, ipAddress?: string) {
  const start = new Date(data.startDateTime);
  const end = new Date(data.endDateTime);

  if (end <= start) {
    throw new AppError('End date/time must be after start date/time', 400);
  }

  const event = await prisma.event.create({
    data: {
      title: data.title,
      description: data.description,
      category: data.category,
      venue: data.venue,
      startDateTime: start,
      endDateTime: end,
      totalCapacity: data.totalCapacity,
      availableCapacity: data.totalCapacity,
      status: 'PUBLISHED', // Direct publish or draft depending on workflow
      bannerUrl: data.bannerUrl || null,
      organizerId,
    },
    include: {
      organizer: {
        select: { id: true, name: true, email: true, department: true },
      },
    },
  });

  await logAudit({
    action: 'EVENT_CREATE',
    entityType: 'EVENT',
    entityId: event.id,
    userId: organizerId,
    metadata: { title: event.title, totalCapacity: event.totalCapacity },
    ipAddress,
  });

  return event;
}

export async function getEvents(filters: EventFilterQuery) {
  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(50, Math.max(1, filters.limit || 12));
  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (filters.status) {
    whereClause.status = filters.status;
  } else {
    // Default public listing only shows PUBLISHED events
    whereClause.status = 'PUBLISHED';
  }

  if (filters.category && filters.category !== 'ALL') {
    whereClause.category = filters.category;
  }

  if (filters.search) {
    whereClause.OR = [
      { title: { contains: filters.search } },
      { description: { contains: filters.search } },
      { venue: { contains: filters.search } },
    ];
  }

  if (filters.upcomingOnly) {
    whereClause.endDateTime = { gte: new Date() };
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where: whereClause,
      include: {
        organizer: {
          select: { id: true, name: true, department: true },
        },
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { startDateTime: 'asc' },
      skip,
      take: limit,
    }),
    prisma.event.count({ where: whereClause }),
  ]);

  return {
    events,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getEventById(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      organizer: {
        select: { id: true, name: true, email: true, department: true },
      },
      _count: {
        select: { bookings: true },
      },
    },
  });

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  return event;
}

export async function updateEvent(
  eventId: string,
  data: UpdateEventDTO,
  userId: string,
  userRole: string,
  ipAddress?: string
) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  if (userRole !== 'ADMIN' && event.organizerId !== userId) {
    throw new AppError('You do not have permission to modify this event', 403);
  }

  const updateData: any = {};

  if (data.title) updateData.title = data.title;
  if (data.description) updateData.description = data.description;
  if (data.category) updateData.category = data.category;
  if (data.venue) updateData.venue = data.venue;
  if (data.bannerUrl !== undefined) updateData.bannerUrl = data.bannerUrl;
  if (data.status) updateData.status = data.status;

  if (data.startDateTime) updateData.startDateTime = new Date(data.startDateTime);
  if (data.endDateTime) updateData.endDateTime = new Date(data.endDateTime);

  if (data.totalCapacity !== undefined) {
    const bookedCount = event.totalCapacity - event.availableCapacity;
    if (data.totalCapacity < bookedCount) {
      throw new AppError(
        `Cannot reduce capacity below currently booked seats (${bookedCount})`,
        400
      );
    }
    updateData.totalCapacity = data.totalCapacity;
    updateData.availableCapacity = data.totalCapacity - bookedCount;
  }

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: updateData,
    include: {
      organizer: {
        select: { id: true, name: true, department: true },
      },
    },
  });

  await logAudit({
    action: 'EVENT_UPDATE',
    entityType: 'EVENT',
    entityId: eventId,
    userId,
    metadata: { changes: updateData },
    ipAddress,
  });

  return updated;
}

export async function cancelEvent(
  eventId: string,
  userId: string,
  userRole: string,
  ipAddress?: string
) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  if (userRole !== 'ADMIN' && event.organizerId !== userId) {
    throw new AppError('Unauthorized to cancel this event', 403);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const ev = await tx.event.update({
      where: { id: eventId },
      data: { status: 'CANCELLED' },
    });

    // Mark all bookings and tickets as CANCELLED
    await tx.booking.updateMany({
      where: { eventId },
      data: { status: 'CANCELLED' },
    });

    const bookings = await tx.booking.findMany({
      where: { eventId },
      select: { id: true },
    });

    const bookingIds = bookings.map((b) => b.id);
    if (bookingIds.length > 0) {
      await tx.ticket.updateMany({
        where: { bookingId: { in: bookingIds } },
        data: { status: 'CANCELLED' },
      });
    }

    return ev;
  });

  await logAudit({
    action: 'EVENT_CANCEL',
    entityType: 'EVENT',
    entityId: eventId,
    userId,
    ipAddress,
  });

  return updated;
}

export async function getOrganizerMetrics(organizerId: string, isAdmin = false) {
  const whereClause = isAdmin ? {} : { organizerId };

  const events = await prisma.event.findMany({
    where: whereClause,
    include: {
      bookings: {
        include: {
          ticket: true,
        },
      },
    },
  });

  const totalEvents = events.length;
  const now = new Date();
  const upcomingEvents = events.filter((e) => new Date(e.startDateTime) > now).length;
  
  let totalBookings = 0;
  let totalCapacity = 0;
  let totalValidatedTickets = 0;

  events.forEach((e) => {
    totalCapacity += e.totalCapacity;
    const activeBookings = e.bookings.filter((b) => b.status === 'CONFIRMED');
    totalBookings += activeBookings.length;
    activeBookings.forEach((b) => {
      if (b.ticket && b.ticket.status === 'USED') {
        totalValidatedTickets++;
      }
    });
  });

  const validationRate = totalBookings > 0 
    ? Math.round((totalValidatedTickets / totalBookings) * 100) 
    : 0;

  const capacityFillRate = totalCapacity > 0
    ? Math.round((totalBookings / totalCapacity) * 100)
    : 0;

  return {
    totalEvents,
    upcomingEvents,
    totalBookings,
    totalCapacity,
    totalValidatedTickets,
    validationRate,
    capacityFillRate,
    eventsSummary: events.map((e) => ({
      id: e.id,
      title: e.title,
      category: e.category,
      venue: e.venue,
      status: e.status,
      startDateTime: e.startDateTime,
      totalCapacity: e.totalCapacity,
      availableCapacity: e.availableCapacity,
      bookedCount: e.bookings.filter((b) => b.status === 'CONFIRMED').length,
      validatedCount: e.bookings.filter((b) => b.ticket?.status === 'USED').length,
    })),
  };
}
