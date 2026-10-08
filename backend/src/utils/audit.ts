import prisma from './prisma';

export interface AuditLogParams {
  action: string;
  entityType: string;
  entityId?: string;
  userId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}

export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        userId: params.userId,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        ipAddress: params.ipAddress,
      },
    });
  } catch (error) {
    // Audit logging should not crash business transactions, but log to stderr
    console.error('[AUDIT_LOG_ERROR]', error);
  }
}
