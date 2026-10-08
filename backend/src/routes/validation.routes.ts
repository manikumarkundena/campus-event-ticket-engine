import { Router } from 'express';
import * as validationController from '../controllers/validation.controller';
import { validateBody } from '../middleware/validate';
import { verifyTicketSchema } from '../validators';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Validation endpoints are restricted to GATE_STAFF, ORGANIZER, or ADMIN
router.use(authenticate);
router.use(requireRole(['GATE_STAFF', 'ORGANIZER', 'ADMIN']));

router.post('/verify', validateBody(verifyTicketSchema), validationController.verify);
router.get('/recent', validationController.getRecent);

export default router;
