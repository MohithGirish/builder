/*
 * project.controller.js — HTTP request handlers for project CRUD operations.
 *
 * Exposes five controller functions: listProjects (public/role-filtered with
 * pagination), getProject (resolves by slug or UUID, increments view count),
 * createProject (builder only), updateProject (owner or admin), and
 * deleteProject (owner or admin). Anonymous and investor callers are restricted
 * to active/completed projects; a builder sees all statuses of their OWN
 * projects only; admins see everything and bypass the public cache.
 * createProject additionally requires the builder to be admin-verified.
 */
'use strict';

const { Op }     = require('sequelize');
const { Project, User } = require('../models');
const { success } = require('../utils/response');
const AppError   = require('../utils/AppError');
const { cacheAside, getVersion, bumpVersion } = require('../services/redis.service');

const BUILDER_ATTRS    = ['id', 'first_name', 'last_name', 'is_verified'];
const PUBLIC_LIST_TTL  = 60; // seconds — short TTL backed by version invalidation
const PUBLIC_STATUSES  = ['active', 'completed'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** List projects — public or filtered by builder */
async function listProjects(req, res, next) {
  try {
    const { builder_id, status, city, type, page = 1, limit = 20 } = req.query;
    const lim  = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const pg   = Math.max(1, parseInt(page, 10) || 1);
    const offset = (pg - 1) * lim;

    const where = {};
    if (builder_id) where.builder_id  = builder_id;
    if (status)     where.status      = status;
    if (city)       where.city        = { [Op.iLike]: `%${city}%` };
    if (type)       where.project_type = { [Op.iLike]: `%${type}%` };

    // Visibility rules:
    //   • admin              → sees everything (all statuses/builders) — no narrowing
    //   • builder, own scope → sees all of their own statuses (default when no
    //                          builder_id, or when explicitly their own id)
    //   • everyone else      → active/completed only. This includes a builder
    //                          who requests ANOTHER builder's id, so they can
    //                          never see a peer's draft/paused/inactive projects.
    // (Reachable for real now that GET / is optionally-authenticated: before,
    // `authenticate` guaranteed req.user and the anonymous branch was dead code.)
    const isAdmin   = req.user && req.user.role === 'admin';
    const isBuilder = req.user && req.user.role === 'builder';
    const ownScope  = isBuilder && (!builder_id || builder_id === req.user.id);
    if (isBuilder && !builder_id) where.builder_id = req.user.id;
    if (!isAdmin && !ownScope) {
      // Overrides any caller-supplied ?status= — which is why the cache key
      // below can safely omit `status` for public callers.
      where.status = { [Op.in]: PUBLIC_STATUSES };
    }

    const runQuery = async () => {
      const { count, rows } = await Project.findAndCountAll({
        where,
        include: [{ model: User, as: 'builder', attributes: BUILDER_ATTRS }],
        order:   [['created_at', 'DESC']],
        limit:   lim,
        offset,
      });
      return {
        projects:   rows,
        pagination: {
          total: count,
          page:  pg,
          limit: lim,
          pages: Math.ceil(count / lim),
        },
      };
    };

    // Cache the public (anonymous/investor) listing only — a builder's own view
    // is user-scoped, and an admin's is unrestricted; caching either would
    // poison the shared public cache. Keyed by query + a version counter that
    // create/update/delete bump for O(1) invalidation.
    const isPublic = !req.user || (req.user.role !== 'builder' && req.user.role !== 'admin');
    let payload;
    if (isPublic) {
      const ver = await getVersion('projects:list');
      const key = `projects:list:${ver}:${JSON.stringify({ builder_id, city, type, page, limit })}`;
      payload = await cacheAside(key, PUBLIC_LIST_TTL, runQuery);
    } else {
      payload = await runQuery();
    }

    res.json(success(payload));
  } catch (err) {
    next(err);
  }
}

/** Get a single project by slug or UUID (public; optional auth) */
async function getProject(req, res, next) {
  try {
    const { id } = req.params;
    const project = await Project.findOne({
      where:   UUID_RE.test(id) ? { id } : { slug: id },
      include: [{ model: User, as: 'builder', attributes: BUILDER_ATTRS }],
    });
    if (!project) throw new AppError('Project not found.', 404, 'NOT_FOUND');

    // Same visibility rules as listProjects. 404 rather than 403 so an anonymous
    // caller cannot probe for the existence of an unlisted draft.
    const isAdmin = req.user && req.user.role === 'admin';
    const isOwner = req.user && req.user.id === project.builder_id;
    if (!isAdmin && !isOwner && !PUBLIC_STATUSES.includes(project.status)) {
      throw new AppError('Project not found.', 404, 'NOT_FOUND');
    }

    await project.increment('view_count');
    res.json(success({ project }));
  } catch (err) {
    next(err);
  }
}

/** Create a new project (builder only, and only once admin-verified) */
async function createProject(req, res, next) {
  try {
    const me = await User.findByPk(req.user.id);
    if (!me || !me.is_verified) {
      throw new AppError(
        'Your builder account must be verified by an admin before you can list projects.',
        403,
        'BUILDER_NOT_VERIFIED'
      );
    }

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

    await bumpVersion('projects:list'); // invalidate cached public listings
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
    await bumpVersion('projects:list'); // invalidate cached public listings
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
    await bumpVersion('projects:list'); // invalidate cached public listings
    res.json(success({ message: 'Project deleted.' }));
  } catch (err) {
    next(err);
  }
}

module.exports = { listProjects, getProject, createProject, updateProject, deleteProject };
