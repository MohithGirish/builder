/*
 * brochure.routes.js — Express route for AI brochure extraction.
 *
 * Single authenticated endpoint POST /extract that accepts a multipart
 * "brochure" file (in memory) and returns the listing fields Claude extracted.
 * Multer caps the upload at 20 MB — Claude allows a 32 MB request and base64
 * inflates ~33%, so 20 MB raw stays safely under the limit. Mounted at
 * /api/v1/brochure.
 */
'use strict';

const { Router } = require('express');
const multer     = require('multer');
const authenticate = require('../middleware/authenticate');
const AppError     = require('../utils/AppError');
const { extract }  = require('../controllers/brochure.controller');

const MAX_BYTES = 20 * 1024 * 1024;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_BYTES } });

const router = Router();
router.use(authenticate);

router.post(
  '/extract',
  (req, res, next) => {
    // Wrap multer so its size/parse errors become clean client-facing messages.
    upload.single('brochure')(req, res, (err) => {
      if (err) {
        const msg = err.code === 'LIMIT_FILE_SIZE'
          ? 'Brochure is too large. Please upload a file under 20 MB.'
          : 'Could not read the uploaded file.';
        return next(new AppError(msg, 400, 'VALIDATION_ERROR'));
      }
      next();
    });
  },
  extract
);

module.exports = router;
