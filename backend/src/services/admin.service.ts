import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { logAudit } from '../utils/audit';

export async function getAllUsers(page = 1, limit = 20, roleFilter?: string) {
  const skip = (page - 1) * limit;
  const where = roleFilter ? { role: roleFilter } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        usn: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true,
            organizedEvents: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateUserRole(
  targetUserId: string,
  newRole: string,
  adminUserId: string,
  ipAddress?: string
) {
  const allowedRoles = ['STUDENT', 'ORGANIZER', 'ADMIN', 'GATE_STAFF'];
  if (!allowedRoles.includes(newRole)) {
    throw new AppError(`Invalid role '${newRole}'. Allowed: ${allowedRoles.join(', ')}`, 400);
  }

  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const oldRole = user.role;
  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
    select: { id: true, name: true, email: true, role: true, department: true },
  });

  await logAudit({
    action: 'ROLE_CHANGE',
    entityType: 'USER',
    entityId: targetUserId,
    userId: adminUserId,
    metadata: { previousRole: oldRole, newRole },
    ipAddress,
  });

  return updated;
}

export async function getAuditLogs(page = 1, limit = 50, actionFilter?: string) {
  const skip = (page - 1) * limit;
  const where = actionFilter ? { action: actionFilter } : {};

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getSystemStats() {
  const [
    userCount,
    eventCount,
    bookingCount,
    ticketCount,
    usedTicketCount,
    auditLogCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.booking.count(),
    prisma.ticket.count(),
    prisma.ticket.count({ where: { status: 'USED' } }),
    prisma.auditLog.count(),
  ]);

  return {
    users: userCount,
    events: eventCount,
    bookings: bookingCount,
    tickets: ticketCount,
    validatedEntries: usedTicketCount,
    auditLogs: auditLogCount,
    timestamp: new Date().toISOString(),
  };
}
