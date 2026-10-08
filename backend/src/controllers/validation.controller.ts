import { Request, Response, NextFunction } from 'express';
import * as validationService from '../services/validation.service';

export async function verify(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { ticketIdentifier, entryNotes } = req.body;
    const staffUserId = req.user!.userId;
    const result = await validationService.validateTicket(
      ticketIdentifier,
      staffUserId,
      entryNotes,
      req.ip
    );

    // Return 200 regardless of VALID / ALREADY_USED / INVALID so scanner UI renders the appropriate status card
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRecent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const recent = await validationService.getGateRecentValidations(limit);
    res.status(200).json({
      success: true,
      data: recent,
    });
  } catch (error) {
    next(error);
  }
}
