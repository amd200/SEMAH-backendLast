import Joi from 'joi';

export const chatMessageSchema = Joi.object({
  content: Joi.string().min(1).max(500).required(),
});
