import express from 'express';
import {
  authenticatedUser,
  authorizePermissions,
} from '../../middleware/authentication.js';
import {
  getAllNotifications,
  getNotificationById,
  getAuthenticatedClientNotifications,
  getAuthenticatedEmployeeNotifications,
} from '../../controllers/notifications/notifications.controller.js';
const router = express.Router();

router
  .route('/')
  .get([authenticatedUser, authorizePermissions('ADMIN'), getAllNotifications]);

router
  .route('/current-client-notifications')
  .get([authenticatedUser], getAuthenticatedClientNotifications);

router
  .route('/current-employee-notifications')
  .get([authenticatedUser], getAuthenticatedEmployeeNotifications);

router.route('/:id').get([authenticatedUser], getNotificationById);

export default router;
