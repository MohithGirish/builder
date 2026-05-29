/*
 * project.controller.js — HTTP request handlers for project CRUD operations.
 *
 * Exposes five controller functions: listProjects (public/role-filtered with
 * pagination), getProject (increments view count), createProject (builder
 * only), updateProject (owner or admin), and deleteProject (owner or admin).
 * Non-builder users are restricted to active/completed projects in list queries.
 */
'use strict';

const { Op }     = require('sequelize');
const { Project, User } = require('../models');
const { success } = require('../utils/response');
const AppError   = require('../utils/AppError');

const BUILDER_ATTRS = ['id', 'first_name', 'last_name', 'is_verified'];

/** List projects — public or filtered by builder */
async function listProjects(req, res, next) {
  try {
    const { builder_id, status, city, type, page = 1, limit = 20 } = req.query;
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * Math.min(50, parseInt(limit, 10));

    const where = {};
    if (builder_id) where.builder_id  = builder_id;
    if (status)     where.status      = status;
    if (city)       where.city        = { [Op.iLike]: `%${city}%` };
    if (type)       where.project_type = { [Op.iLike]: `%${type}%` };

    // Non-builders only see active/completed projects
    if (!req.user || req.user.role !== 'builder') {
      where.status = { [Op.in]: ['active', 'completed'] };
    } else if (req.user.role === 'builder' && !builder_id) {
      where.builder_id = req.user.id;
    }

    const { count, rows } = await Project.findAndCountAll({
      where,
      include: [{ model: User, as: 'builder', attributes: BUILDER_ATTRS }],
      order:   [['created_at', 'DESC']],
      limit:   Math.min(50, parseInt(limit, 10)),
      offset,
    });

    res.json(success({
      projects:   rows,
      pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total: count },
    }));
  } catch (err) {
    next(err);
  }
}

/** Get a single project */
async function getProject(req, res, next) {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [{ model: User, as: 'builder', attributes: BUILDER_ATTRS }],
    });
    if (!project) throw new AppError('Project not found.', 404, 'NOT_FOUND');

    await project.increment('view_count');
    res.json(success({ project }));
  } catch (err) {
    next(err);
  }
}

/** Create a new project (builder only) */
async function createProject(req, res, next) {
  try {
    const {
      name, description, project_type, city, location,
      funding_target, roi_projected, image_url, rera_approved,
    } = req.body;

    const project = await Project.create({
      builder_id:     req.user.id,
      name,
      description,
      project_type,
      city,
      location,
      funding_target: parseFloat(funding_target) || 0,
      funding_raised: 0,
      roi_projected:  roi_projected ? parseFloat(roi_projected) : null,
      image_url,
      rera_approved:  Boolean(rera_approved),
      status:         'active',
    });

    res.status(201).json(success({ project }));
  } catch (err) {
    next(err);
  }
}

/** Update a project (owner only) */
async function updateProject(req, res, next) {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) throw new AppError('Project not found.', 404, 'NOT_FOUND');
    if (project.builder_id !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Access denied.', 403, 'FORBIDDEN');
    }

    const allowed = [
      'name', 'description', 'project_type', 'city', 'location',
      'funding_target', 'funding_raised', 'roi_projected',
      'image_url', 'rera_approved', 'status',
    ];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    await project.update(updates);
    res.json(success({ project }));
  } catch (err) {
    next(err);
  }
}

/** Delete a project (owner or admin) */
async function deleteProject(req, res, next) {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) throw new AppError('Project not found.', 404, 'NOT_FOUND');
    if (project.builder_id !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Access denied.', 403, 'FORBIDDEN');
    }

    await project.destroy();
    res.json(success({ message: 'Project deleted.' }));
  } catch (err) {
    next(err);
  }
}

module.exports = { listProjects, getProject, createProject, updateProject, deleteProject };
