/*
 * quote.validators.js — Joi request body validators for quote routes.
 *
 * Defines three Joi schemas: createQuoteSchema (POST /quotes), siteVisitSchema
 * (POST /quotes/site-visit), and builderResponseSchema (POST /quotes/respond/:token).
 * Because these endpoints are public and trigger emails to caller-supplied
 * addresses, the schemas enforce valid email formats and cap field lengths.
 * The validate() factory strips unknown fields, aborts on the first error, and
 * returns a 422 JSON response with a VALIDATION_ERROR code. Exports
 * validateCreateQuote, validateSiteVisit, and validateBuilderResponse middleware.
 */
'use strict';

const Joi = require('joi');

const email = () =>
  Joi.string().email({ tlds: { allow: false } }).messages({
    'string.email': 'Please provide a valid email address.',
  });

const createQuoteSchema = Joi.object({
  projectId:    Joi.alternatives().try(Joi.string(), Joi.number()).required()
    .messages({ 'any.required': 'projectId is required.' }),
  projectName:  Joi.string().trim().max(120).required()
    .messages({ 'any.required': 'projectName is required.' }),
  projectEmail: email().required()
    .messages({ 'any.required': 'projectEmail is required.' }),
  userName:     Joi.string().trim().min(2).max(120).required()
    .messages({ 'any.required': 'userName is required.' }),
  userEmail:    email().required()
    .messages({ 'any.required': 'userEmail is required.' }),
  accountEmail: email().allow(null),
  userPhone:    Joi.string().trim().min(7).max(20).required()
    .messages({ 'any.required': 'userPhone is required.' }),
  whatsappConsent:   Joi.boolean(),
  layoutPreferences: Joi.array().max(20).items(Joi.string().max(100)),
  requirements:      Joi.string().max(2000).allow(''),
});

const siteVisitSchema = Joi.object({
  projectName:   Joi.string().trim().max(120).required(),
  projectEmail:  email().required(),
  visitorName:   Joi.string().trim().min(2).max(120).required(),
  visitorEmail:  email().required(),
  visitorPhone:  Joi.string().trim().min(7).max(20).required(),
  preferredDate: Joi.string().trim().max(40).required(),
  preferredTime: Joi.string().trim().max(40).required(),
  notes:         Joi.string().max(1000).allow(''),
});

const builderResponseSchema = Joi.object({
  builderResponse:   Joi.string().trim().min(1).max(5000).required()
    .messages({ 'any.required': 'builderResponse is required.' }),
  builderQuotePrice: Joi.string().max(200).allow(null, ''),
  builderTimeline:   Joi.string().max(200).allow(null, ''),
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
  validateCreateQuote:     validate(createQuoteSchema),
  validateSiteVisit:       validate(siteVisitSchema),
  validateBuilderResponse: validate(builderResponseSchema),
};
