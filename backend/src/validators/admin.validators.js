/*
 * admin.validators.js — Joi request body validator for admin console routes.
 *
 * Defines reviewVerificationSchema for PATCH /admin/verifications/:userId:
 * action must be 'approve' or 'reject'; reason (1–500 chars) is required when
 * rejecting and forbidden otherwise. The validate() factory wraps it in an
 * Express middleware returning 422 on failure. Exports validateReviewVerification.
 */
'use strict';

const Joi = require('joi');

const reviewVerificationSchema = Joi.object({
  action: Joi.string().valid('approve', 'reject').required()
    .messages({
      'any.only': 'action must be "approve" or "reject".',
      'any.required': 'action is required.',
    }),
  reason: Joi.string().trim().min(1).max(500)
    .when('action', {
      is:        'reject',
      then:      Joi.required().messages({ 'any.required': 'reason is required when rejecting.' }),
      otherwise: Joi.forbidden().messages({ 'any.unknown': 'reason is only allowed when rejecting.' }),
    }),
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
  validateReviewVerification: validate(reviewVerificationSchema),
};
