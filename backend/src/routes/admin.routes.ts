import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// All admin routes strictly require ADMIN role
router.use(authenticate);
router.use(requireRole(['ADMIN']));

router.get('/users', adminController.getUsers);
router.put('/users/:userId/role', adminController.updateRole);
router.get('/audit', adminController.getAudit);
router.get('/stats', adminController.getStats);

export default router;
