import express from 'express';
import {
  getAllAdmins,
  getAdminById,
  deleteAdmin,
  showCurrentAdmin,
} from '../../controllers/admins/user.controller.js';
import {
  authenticatedUser,
  authorizePermissions,
} from '../../middleware/authentication.js';
const router = express.Router();

router
  .route('/')
  .get([authenticatedUser, authorizePermissions('ADMIN')], getAllAdmins);

router.route('/showCurrent').get(authenticatedUser, showCurrentAdmin);
router
  .route('/:id')
  .get([authenticatedUser, authorizePermissions('ADMIN')], getAdminById)
  .delete([authenticatedUser, authorizePermissions('ADMIN')], deleteAdmin);

export default router;
