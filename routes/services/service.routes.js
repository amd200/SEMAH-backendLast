import express from 'express';
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} from '../../controllers/services/service.controller.js';
import {
  authenticatedUser,
  authorizePermissions,
} from '../../middleware/authentication.js';
const router = express.Router();

router
  .route('/')
  .post([authenticatedUser, authorizePermissions('ADMIN')], createService);
router.route('/').get([authenticatedUser], getAllServices);
router
  .route('/:id')
  .get([authenticatedUser], getServiceById)
  .patch([authenticatedUser, authorizePermissions('ADMIN')], updateService)
  .delete([authenticatedUser, authorizePermissions('ADMIN')], deleteService);

export default router;
