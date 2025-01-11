import express from 'express';
import {
  createCommissioner,
  getAllCommissioners,
  loginCommissioner,
  getCommissionerById,
  updateCommissioner,
} from '../../controllers/clients/comissioner.controller.js';
import { authenticatedUser } from '../../middleware/authentication.js';
const router = express.Router();

router.route('/create').post([authenticatedUser], createCommissioner);
router.route('/login').post(loginCommissioner);
router.route('/').get([authenticatedUser], getAllCommissioners);
router
  .route('/:id')
  .get([authenticatedUser], getCommissionerById)
  .patch([authenticatedUser], updateCommissioner);

export default router;
