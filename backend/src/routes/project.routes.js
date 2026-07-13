/*
 * project.routes.js — Express routes for project CRUD endpoints.
 *
 * Defines: GET / (list projects) and GET /:id (single project, by slug or UUID) —
 * both PUBLIC with optional auth, since Home/Projects/ProjectDetail render for
 * logged-out visitors; the controller narrows visibility by role. POST /
 * (builder-only create), PATCH /:id (builder or admin update), and DELETE /:id
 * (builder or admin delete) require authentication plus a role check.
 */
'use strict';

const { Router } = require('express');
const authenticate         = require('../middleware/authenticate');
const optionalAuthenticate = require('../middleware/optionalAuthenticate');
const authorize            = require('../middleware/authorize');
const {
  listProjects, getProject, createProject, updateProject, deleteProject,
} = require('../controllers/project.controller');

const router = Router();

// Public reads (optional auth — controller narrows visibility by role)
router.get('/',    optionalAuthenticate, listProjects);
router.get('/:id', optionalAuthenticate, getProject);

// Protected mutations
router.post('/',      authenticate, authorize('builder'), createProject);
router.patch('/:id',  authenticate, authorize('builder', 'admin'), updateProject);
router.delete('/:id', authenticate, authorize('builder', 'admin'), deleteProject);

module.exports = router;
