import express from 'express';
import {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} from '../../controllers/companies/company.controller.js';
import {
  authenticatedUser,
  authorizePermissions,
} from '../../middleware/authentication.js';
import { validate } from '../../middleware/validation.js';
import { companySchema } from '../../utils/validation/company.validation.js';
const router = express.Router();

router
  .route('/')
  .post([authenticatedUser], validate(companySchema), createCompany);
router
  .route('/')
  .get([authenticatedUser, authorizePermissions('ADMIN')], getAllCompanies);
router
  .route('/:id')
  .get([authenticatedUser, authorizePermissions('ADMIN')], getCompanyById)
  .patch([authenticatedUser], updateCompany)
  .delete([authenticatedUser], deleteCompany);

export default router;
