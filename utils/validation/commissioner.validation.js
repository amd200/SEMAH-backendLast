import Joi from 'joi';

export const commissionerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  identityNumber: Joi.string().max(10).messages({
    'string.max': 'identityNumber only 10 characters',
  }),
  phoneNumber: Joi.string()
    .pattern(/^\+?[0-9]{8,15}$/)
    .required()
    .messages({
      'string.pattern.base': `Phone number must start with ' + ' followed by 8 to 15 digits`,
    }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
});

export const commissionerLoginSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^\+?[0-9]{8,15}$/)
    .required()
    .messages({
      'string.pattern.base': `Phone number must start with ' + ' followed by 8 to 15 digits`,
    }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
});
