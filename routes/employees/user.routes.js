import express from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  showCurrentEmployee,
} from '../../controllers/employees/user.controller.js';
import {
  authenticatedUser,
  authorizePermissions,
} from '../../middleware/authentication.js';
const router = express.Router();

router
  .route('/')
  .get([authenticatedUser, authorizePermissions('ADMIN')], getAllEmployees);

router.route('/showCurrent').get([authenticatedUser], showCurrentEmployee);
router
  .route('/:id')
  .get([authenticatedUser, authorizePermissions('ADMIN')], getEmployeeById)
  .patch([authenticatedUser, authorizePermissions('ADMIN')], updateEmployee)
  .delete([authenticatedUser, authorizePermissions('ADMIN')], deleteEmployee);

export default router;
