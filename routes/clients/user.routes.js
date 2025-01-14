import express from 'express';
import {
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  showCurrentClient,
} from '../../controllers/clients/user.controller.js';
import {
  authenticatedUser,
  authorizePermissions,
} from '../../middleware/authentication.js';
const router = express.Router();

router
  .route('/')
  .get([authenticatedUser, authorizePermissions('ADMIN')], getAllClients);

router.route('/showCurrent').get(authenticatedUser, showCurrentClient);
router
  .route('/:id')
  .delete([authenticatedUser, authorizePermissions('ADMIN')], deleteClient)
  .get([authenticatedUser, authorizePermissions('ADMIN')], getClientById)
  .patch([authenticatedUser, authorizePermissions('ADMIN')], updateClient);

export default router;
