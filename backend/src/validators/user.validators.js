/*
 * user.validators.js — Joi request body validators for user profile routes.
 *
 * Defines two schemas: updateProfileSchema (at least one of first_name,
 * last_name, or profile_image URI) and updateStatusSchema (is_active boolean).
 * The validate() factory wraps each in an Express middleware returning 422 on
 * failure. Exports validateUpdateProfile and validateUpdateStatus middleware
 * used by the user routes.
 */
'use strict';

const Joi = require('joi');

const updateProfileSchema = Joi.object({
  first_name: Joi.string().trim().min(2).max(100),
  last_name:  Joi.string().trim().min(2).max(100),
  profile_image: Joi.string().uri().max(500).allow(null, ''),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update.',
});

const updateStatusSchema = Joi.object({
  is_active: Joi.boolean().required()
    .messages({ 'any.required': 'is_active is required.' }),
});

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: true,
      stripUnknown: true,
    });

    if (error) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message,
        },
      });
    }

    req.body = value;
    return next();
  };
}

module.exports = {
  validateUpdateProfile: validate(updateProfileSchema),
  validateUpdateStatus:  validate(updateStatusSchema),
};
