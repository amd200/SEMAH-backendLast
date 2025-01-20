import express from 'express';
import {
  clientRegister,
  verifyClientEmail,
  verifyClientPhone,
  verifyWithPhone,
  clientLogin,
  clientLoginWithPhone,
  verifyUsingWhatsApp,
  confirmWhatsAppVerification,
  logout,
  testSms,
  forgetPassword,
  resetPassword,
  resendConfirmationCode,
  forgetPasswordEmail,
  resetPasswordEmail,
} from '../../controllers/clients/auth.controller.js';
import {
  authenticatedUser,
  authorizePermissions,
} from '../../middleware/authentication.js';
import { validate } from '../../middleware/validation.js';
import {
  loginSchema,
  loginWithPhoneSchema,
  clientRegisterSchema,
  clientForgetPassword,
  clientResetPassword,
} from '../../utils/validation/auth.validation.js';
const router = express.Router();

router.post('/client/register', validate(clientRegisterSchema), clientRegister);
router.post('/client/resend-code', resendConfirmationCode);
router.post('/client/login', validate(loginSchema), clientLogin);
router.post('/client/verify-email', verifyClientEmail);
router.post('/client/verify-with-phone', verifyWithPhone);
router.post('/client/verify-phone', verifyClientPhone);
router.post(
  '/client/login-with-phone',
  validate(loginWithPhoneSchema),
  clientLoginWithPhone
);
router.get('/client/logout', logout);
router.post(
  '/test-sms',
  [authenticatedUser, authorizePermissions('ADMIN')],
  testSms
);
router.post('/client/verify-whatsapp', verifyUsingWhatsApp);
router.post(
  '/client/confirm-whatsapp-verification',
  confirmWhatsAppVerification
);

router.post(
  '/forget-password-phone',
  validate(clientForgetPassword),
  forgetPassword
);
router.post(
  '/reset-password-phone',
  validate(clientResetPassword),
  resetPassword
);

router.post('/forget-password-email', forgetPasswordEmail);
router.post('/reset-password-email', resetPasswordEmail);
export default router;
