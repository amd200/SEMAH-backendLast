import express from 'express';
import {
  employeeRegister,
  verifyEmployee,
  employeeLogin,
  verifyUsingWhatsApp,
  confirmWhatsAppVerification,
  logout,
} from '../../controllers/employees/auth.controller.js';
import { validate } from '../../middleware/validation.js';
import {
  loginSchema,
  employeeRegisterSchema,
} from '../../utils/validation/auth.validation.js';
const router = express.Router();

router.post(
  '/employee/register',
  validate(employeeRegisterSchema),
  employeeRegister
);
router.post('/employee/verify', verifyEmployee);
router.post('/employee/verify-with-whatsapp', verifyUsingWhatsApp);
router.post('/employee/confirm-whatsapp', confirmWhatsAppVerification);
router.post('/employee/login', validate(loginSchema), employeeLogin);
router.get('/employee/logout', logout);

export default router;
