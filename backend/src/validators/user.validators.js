/*
 * user.validators.js — Joi request body validators for user profile routes.
 *
 * Defines three schemas: updateProfileSchema (at least one of first_name,
 * last_name, or profile_image URI), updateStatusSchema (is_active boolean),
 * and submitVerificationSchema (India statutory builder credentials — RERA,
 * PAN, GSTIN, entity type + CIN/LLPIN, plus optional cert metadata). The
 * validate() factory wraps each in an Express middleware returning 422 on
 * failure. Exports validateUpdateProfile, validateUpdateStatus, and
 * validateSubmitVerification middleware used by the user routes.
 */
'use strict';

const Joi = require('joi');

// Statutory-format regexes — kept in lockstep with frontend/src/lib/verification.js.
const PAN_RE   = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const CIN_RE   = /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;
const LLPIN_RE = /^[A-Z]{3}-[0-9]{4}$/;
const RERA_RE  = /^[A-Z0-9/-]+$/;

// Optional uploaded-cert metadata (no file bytes — reference only) or null.
const certMeta = Joi.object({
  name:    Joi.string().max(255).required(),
  size:    Joi.number().required(),
  type:    Joi.string().max(100).required(),
  addedAt: Joi.string().max(40).required(),
}).allow(null);

const updateProfileSchema = Joi.object({
  first_name: Joi.string().trim().min(2).max(100),
  last_name:  Joi.string().trim().min(1).max(100),
  profile_image: Joi.string().uri().max(500).allow(null, ''),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update.',
});

const updateStatusSchema = Joi.object({
  is_active: Joi.boolean().required()
    .messages({ 'any.required': 'is_active is required.' }),
});

const submitVerificationSchema = Joi.object({
  reraState:  Joi.string().trim().min(1).max(100).required()
    .messages({ 'any.required': 'reraState is required.' }),
  reraNumber: Joi.string().trim().uppercase().pattern(RERA_RE).required()
    .messages({
      'string.pattern.base': 'reraNumber may contain letters, digits, "/" and "-" only.',
      'any.required': 'reraNumber is required.',
    }),
  pan: Joi.string().trim().uppercase().pattern(PAN_RE).required()
    .messages({
      'string.pattern.base': 'PAN must be 5 letters, 4 digits, then 1 letter (e.g. ABCDE1234F).',
      'any.required': 'pan is required.',
    }),
  gstin: Joi.string().trim().uppercase().pattern(GSTIN_RE).required()
    .messages({
      'string.pattern.base': 'GSTIN must be a valid 15-character GSTIN.',
      'any.required': 'gstin is required.',
    }),
  entityType: Joi.string().valid('private_ltd', 'public_ltd', 'llp', 'partnership', 'proprietorship').required()
    .messages({
      'any.only': 'entityType must be one of private_ltd, public_ltd, llp, partnership, proprietorship.',
      'any.required': 'entityType is required.',
    }),
  entityId: Joi.string().trim().uppercase().min(1).max(30).required()
    .when('entityType', {
      is:   Joi.valid('private_ltd', 'public_ltd'),
      then: Joi.string().pattern(CIN_RE).messages({
        'string.pattern.base': 'entityId must be a valid CIN (e.g. U70100MH2015PTC123456).',
      }),
    })
    .when('entityType', {
      is:   'llp',
      then: Joi.string().pattern(LLPIN_RE).messages({
        'string.pattern.base': 'entityId must be a valid LLPIN (e.g. AAA-1234).',
      }),
    })
    .messages({ 'any.required': 'entityId is required.' }),
  // Tier 2 / Tier 3 — all optional.
  completionCert:   certMeta,
  commencementCert: certMeta,
  isoCert:          certMeta,
  bocw:       Joi.string().max(100).allow(''),
  epf:        Joi.string().max(100).allow(''),
  esi:        Joi.string().max(100).allow(''),
  membership: Joi.string().max(100).allow(''),
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
  validateUpdateProfile:      validate(updateProfileSchema),
  validateUpdateStatus:       validate(updateStatusSchema),
  validateSubmitVerification: validate(submitVerificationSchema),
};
