/*
 * auth.validators.js — Joi request body validators for authentication routes.
 *
 * Defines three Joi schemas: registerSchema (email, strong password, names,
 * role), loginSchema (email, password), and refreshSchema (refresh_token).
 * The validate() factory wraps each schema in an Express middleware that strips
 * unknown fields, aborts on the first error, and returns a 422 JSON response
 * with a VALIDATION_ERROR code. Exports validateRegister, validateLogin, and
 * validateRefresh middleware.
 */
'use strict';

const Joi = require('joi');

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const registerSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().required()
    .messages({
      'string.email': 'Please provide a valid email address.',
      'any.required': 'Email is required.',
    }),
  password: Joi.string().pattern(PASSWORD_REGEX).required()
    .messages({
      'string.pattern.base':
        'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character (@$!%*?&).',
      'any.required': 'Password is required.',
    }),
  first_name: Joi.string().trim().min(2).max(100).required()
    .messages({ 'any.required': 'First name is required.' }),
  last_name: Joi.string().trim().min(2).max(100).required()
    .messages({ 'any.required': 'Last name is required.' }),
  role: Joi.string().valid('builder', 'investor').required()
    .messages({
      'any.only': 'Role must be "builder" or "investor".',
      'any.required': 'Role is required.',
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().required()
    .messages({
      'string.email': 'Please provide a valid email address.',
      'any.required': 'Email is required.',
    }),
  password: Joi.string().required()
    .messages({ 'any.required': 'Password is required.' }),
});

const refreshSchema = Joi.object({
  refresh_token: Joi.string().required()
    .messages({ 'any.required': 'Refresh token is required.' }),
});

/**
 * Middleware factory that validates `req.body` against a Joi schema.
 * Strips unknown fields and aborts on the first error.
 *
 * @param {Joi.Schema} schema
 */
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
  validateRegister: validate(registerSchema),
  validateLogin:    validate(loginSchema),
  validateRefresh:  validate(refreshSchema),
};
