import express from 'express';
import {
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
  checkoutWithStripe,
  handleSuccess,
  getAllOrders,
  getAllPayments,
} from '../../controllers/payments/payment.controller.js';
import {
  authenticatedUser,
  authorizePermissions,
} from '../../middleware/authentication.js';
const router = express.Router();

router
  .route('/')
  .get([authenticatedUser, authorizePermissions('ADMIN')], getAllOrders);
router
  .route('/cart')
  .post([authenticatedUser], addToCart)
  .get([authenticatedUser], getCart);
router.route('/cart').delete([authenticatedUser], removeFromCart);
router.route('/cart/clear').delete([authenticatedUser], clearCart);
router.route('/checkout').post([authenticatedUser], checkoutWithStripe);
router.route('/success').get([authenticatedUser], handleSuccess);

router
  .route('/payments')
  .get([authenticatedUser, authorizePermissions('ADMIN')], getAllPayments);

export default router;
