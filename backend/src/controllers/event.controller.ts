import { Request, Response, NextFunction } from 'express';
import * as eventService from '../services/event.service';

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const organizerId = req.user!.userId;
    const event = await eventService.createEvent(req.body, organizerId, req.ip);
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters = {
      search: req.query.search as string,
      category: req.query.category as string,
      status: req.query.status as string,
      upcomingOnly: req.query.upcomingOnly === 'true',
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 12,
    };
    const result = await eventService.getEvents(filters);
    res.status(200).json({
      success: true,
      data: result.events,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const updated = await eventService.updateEvent(
      req.params.id,
      req.body,
      req.user!.userId,
      req.user!.role,
      req.ip
    );
    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cancelled = await eventService.cancelEvent(
      req.params.id,
      req.user!.userId,
      req.user!.role,
      req.ip
    );
    res.status(200).json({
      success: true,
      message: 'Event cancelled successfully',
      data: cancelled,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrganizerDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const isAdmin = req.user!.role === 'ADMIN';
    const metrics = await eventService.getOrganizerMetrics(req.user!.userId, isAdmin);
    res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
}
