import express from 'express';
import {
  createCommissioner,
  getAllCommissioners,
  loginCommissioner,
  getCommissionerById,
  updateCommissioner,
  deleteCommissioner,
  assignCommissionerToOrder,
} from '../../controllers/clients/comissioner.controller.js';
import { authenticatedUser } from '../../middleware/authentication.js';
import { validate } from '../../middleware/validation.js';
import {
  commissionerSchema,
  commissionerLoginSchema,
} from '../../utils/validation/commissioner.validation.js';
const router = express.Router();

router
  .route('/create')
  .post([authenticatedUser], validate(commissionerSchema), createCommissioner);

router.route('/assign').post([authenticatedUser], assignCommissionerToOrder);
router
  .route('/login')
  .post(validate(commissionerLoginSchema), loginCommissioner);
router.route('/').get([authenticatedUser], getAllCommissioners);
router
  .route('/:id')
  .get([authenticatedUser], getCommissionerById)
  .patch([authenticatedUser], updateCommissioner)
  .delete([authenticatedUser], deleteCommissioner);

export default router;
