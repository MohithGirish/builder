/*
 * optionalAuthenticate.js — Populate req.user when a valid Bearer token is present.
 *
 * For routes that are public but render richer results for a signed-in caller
 * (the project list/detail endpoints). Unlike authenticate.js it never 401s: a
 * missing, malformed, or expired token simply leaves req.user undefined and the
 * request continues as anonymous. Downstream controllers must therefore treat
 * `!req.user` as "least privilege", not "trusted".
 */
'use strict';

const jwt = require('jsonwebtoken');

function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_ACCESS_SECRET);
    req.user = { id: decoded.sub, role: decoded.role };
  } catch {
    // ponytail: bad/expired token → continue anonymously rather than 401.
    // These routes are public; a stale token must not break a logged-out page.
  }
  return next();
}

module.exports = optionalAuthenticate;
