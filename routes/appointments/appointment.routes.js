import express from 'express';
import {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  handlePaidAppointment,
} from '../../controllers/appointments/appointment.controller.js';
import {
  authenticatedUser,
  authorizePermissions,
} from '../../middleware/authentication.js';
const router = express.Router();

router.route('/success').get([authenticatedUser], handlePaidAppointment);
router
  .route('/')
  .post([authenticatedUser], createAppointment)
  .get([authenticatedUser, authorizePermissions('ADMIN')], getAllAppointments);

router
  .route('/:id')
  .get([authenticatedUser, authorizePermissions('ADMIN'), getAppointmentById]);

export default router;
