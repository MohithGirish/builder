/*
 * brochure.controller.js — HTTP handler for AI brochure extraction.
 *
 * extract(): validates the uploaded file's type (multer enforces presence/size)
 * and delegates to brochure.service.extractBrochure(). Responds 200 with
 * { available:false } when the AI is unavailable (no API key) so the client can
 * fall back to manual entry; AI/network failures surface via next() so the
 * global error handler returns a clean message.
 */
'use strict';

const AppError        = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');
const brochureService = require('../services/brochure.service');

async function extract(req, res, next) {
  if (!req.file) return next(new AppError('No file uploaded.', 400, 'VALIDATION_ERROR'));

  const { mimetype, buffer } = req.file;
  const allowed = mimetype === brochureService.PDF_MEDIA || brochureService.IMAGE_MEDIA.has(mimetype);
  if (!allowed) return next(new AppError('Please upload a PDF or image brochure.', 400, 'VALIDATION_ERROR'));

  try {
    const result = await brochureService.extractBrochure({ buffer, mimetype });
    return sendSuccess(res, 200, result);
  } catch (err) {
    return next(new AppError('Could not read that brochure. Please try a smaller or clearer file.', 502, 'AI_ERROR'));
  }
}

module.exports = { extract };
