import express from 'express';
import {
  registerAdmin,
  verifyAdmin,
  adminLogin,
} from '../../controllers/admins/auth.controller.js';
import { validate } from '../../middleware/validation.js';
import {
  loginSchema,
  registerSchema,
} from '../../utils/validation/auth.validation.js';
const router = express.Router();

router.route('/admin/register').post(validate(registerSchema), registerAdmin);
router.route('/admin/verify').post(verifyAdmin);
router.route('/admin/login').post(validate(loginSchema), adminLogin);

export default router;
