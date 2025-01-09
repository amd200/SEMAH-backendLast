import express from 'express';
import {
  createServiceItem,
  getAllServiceItems,
  getServiceItemById,
  updateServiceItem,
  deleteServiceItem,
} from '../../controllers/services/service.item.controller.js';
import {
  authenticatedUser,
  authorizePermissions,
} from '../../middleware/authentication.js';
const router = express.Router();

router
  .route('/')
  .post([authenticatedUser, authorizePermissions('ADMIN')], createServiceItem)
  .get([authenticatedUser], getAllServiceItems);

router
  .route('/:id')
  .get([authenticatedUser], getServiceItemById)
  .patch([authenticatedUser, authorizePermissions('ADMIN')], updateServiceItem)
  .delete(
    [authenticatedUser, authorizePermissions('ADMIN')],
    deleteServiceItem
  );
export default router;
