/*
 * project.routes.js — Express routes for project CRUD endpoints.
 *
 * Defines: GET / (list projects, auth optional — controller limits by role),
 * GET /:id (get single project), POST / (builder-only create), PATCH /:id
 * (builder or admin update), and DELETE /:id (builder or admin delete). All
 * routes require authentication; mutations are additionally restricted by role
 * via the authorize middleware.
 */
'use strict';

const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const authorize    = require('../middleware/authorize');
const {
  listProjects, getProject, createProject, updateProject, deleteProject,
} = require('../controllers/project.controller');

const router = Router();

// Public list (auth optional — controller narrows visibility by role)
router.get('/',    authenticate, listProjects);
router.get('/:id', authenticate, getProject);

// Protected mutations
router.post('/',      authenticate, authorize('builder'), createProject);
router.patch('/:id',  authenticate, authorize('builder', 'admin'), updateProject);
router.delete('/:id', authenticate, authorize('builder', 'admin'), deleteProject);

module.exports = router;
