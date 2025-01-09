import Joi from 'joi';

export const serviceSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
});
