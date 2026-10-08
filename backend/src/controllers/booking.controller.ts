import { Request, Response, NextFunction } from 'express';
import * as bookingService from '../services/booking.service';

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { eventId } = req.body;
    const result = await bookingService.createBooking(userId, eventId, req.ip);
    res.status(201).json({
      success: true,
      message: 'Ticket booked successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const bookings = await bookingService.getUserBookings(userId);
    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const booking = await bookingService.getBookingById(
      req.params.id,
      req.user!.userId,
      req.user!.role
    );
    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
}

export async function cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cancelled = await bookingService.cancelBooking(
      req.params.id,
      req.user!.userId,
      req.user!.role,
      req.ip
    );
    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: cancelled,
    });
  } catch (error) {
    next(error);
  }
}
