import { Router } from 'express';
import * as eventController from '../controllers/event.controller';
import { validateBody } from '../middleware/validate';
import { createEventSchema, updateEventSchema } from '../validators';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', eventController.getAll);
router.get('/:id', eventController.getById);

// Organizer / Admin routes
router.post(
  '/',
  authenticate,
  requireRole(['ORGANIZER', 'ADMIN']),
  validateBody(createEventSchema),
  eventController.create
);

router.put(
  '/:id',
  authenticate,
  requireRole(['ORGANIZER', 'ADMIN']),
  validateBody(updateEventSchema),
  eventController.update
);

router.delete(
  '/:id',
  authenticate,
  requireRole(['ORGANIZER', 'ADMIN']),
  eventController.cancel
);

router.get(
  '/organizer/dashboard',
  authenticate,
  requireRole(['ORGANIZER', 'ADMIN']),
  eventController.getOrganizerDashboard
);

export default router;
