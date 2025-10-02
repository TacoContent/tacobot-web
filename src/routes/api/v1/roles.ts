import { Router } from 'express';
import RolesController from '../../../controllers/api/v1/RolesController';

const router = Router();
const rolesController = new RolesController();

// Get all roles for a guild
router.route('/api/v1/roles/:guild').get(rolesController.getRoles.bind(rolesController));

// Batch roles by IDs - supports POST with body and GET with query params
router.route('/api/v1/roles/:guild/batch/ids')
  .post(rolesController.getRolesByIds.bind(rolesController))
  .get(rolesController.getRolesByIds.bind(rolesController));

export default router;
