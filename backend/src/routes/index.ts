import { Router } from 'express';
import authRoutes from './auth.routes';
import eventRoutes from './event.routes';
import bookingRoutes from './booking.routes';
import validationRoutes from './validation.routes';
import adminRoutes from './admin.routes';
import healthRoutes from './health.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/bookings', bookingRoutes);
router.use('/validation', validationRoutes);
router.use('/admin', adminRoutes);
router.use('/health', healthRoutes);

export default router;
