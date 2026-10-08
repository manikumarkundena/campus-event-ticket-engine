import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller';
import { validateBody } from '../middleware/validate';
import { createBookingSchema } from '../validators';
import { authenticate } from '../middleware/auth';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

router.post('/', validateBody(createBookingSchema), bookingController.create);
router.get('/my', bookingController.getMyBookings);
router.get('/:id', bookingController.getById);
router.post('/:id/cancel', bookingController.cancel);

export default router;
