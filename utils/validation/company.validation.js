import Joi from 'joi';

export const companySchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  commercialNumber: Joi.string().min(5).max(50).required(),
  taxNumber: Joi.string().min(5).max(50).required(),
  address: Joi.string().min(5).max(50).required(),
  owner: Joi.string().min(3).max(50).required(),
  ownerEmail: Joi.string().email().required(),
  ownerPhoneNumber: Joi.string()
    .pattern(/^\+?[0-9]{8,15}$/)
    .required()
    .messages({
      'string.pattern.base': `Phone number must start with ' + ' followed by 8 to 15 digits`,
    }),
});
