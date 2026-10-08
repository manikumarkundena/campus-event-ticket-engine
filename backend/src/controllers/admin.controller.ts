import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/admin.service';

export async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const role = req.query.role as string;
    const result = await adminService.getAllUsers(page, limit, role);
    res.status(200).json({
      success: true,
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role } = req.body;
    const targetUserId = req.params.userId;
    const adminUserId = req.user!.userId;
    const updated = await adminService.updateUserRole(targetUserId, role, adminUserId, req.ip);
    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAudit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const action = req.query.action as string;
    const result = await adminService.getAuditLogs(page, limit, action);
    res.status(200).json({
      success: true,
      data: result.logs,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await adminService.getSystemStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}
