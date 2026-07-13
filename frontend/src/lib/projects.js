/*
 * projects.js — Project API access + row→view shaping.
 *
 * Single source for reading projects from GET /api/v1/projects. shapeProject()
 * flattens a DB row (scalar columns + the `content` JSONB display payload) back
 * into the flat object the cards, map, and detail page consume — so `content.*`
 * keys (tagline, coordinates, sections, highlights…) sit alongside `name`,
 * `location` and friends. Exports useProjects() (list, optionally scoped to a
 * builder) and useProject() (one project by slug or UUID). Both are read-only.
 */
import { useEffect, useState } from 'react';
import { cachedFetch } from './api';
import { useAuth } from '../context/AuthContext';

const RUPEES_PER_CRORE = 1e7;
const toCrore = (v) => Math.round((parseFloat(v) || 0) / RUPEES_PER_CRORE);

/**
 * Flatten a project row for the view layer.
 *
 * `id` becomes the slug (the routing id used by /projects/:id and the static
 * builders.js `projectId` links); the real UUID is preserved as `uuid` for API
 * calls that address the row itself (e.g. the quote socket lookup).
 * funding_* are converted from stored rupees to the ₹ Crore figures every card
 * renders.
 */
export function shapeProject(row) {
  const { content, ...cols } = row;
  return {
    ...(content || {}),
    ...cols,
    id:             row.slug || row.id,
    uuid:           row.id,
    type:           row.project_type,
    thumbnail:      content?.thumbnail || row.image_url,
    funding_target: toCrore(row.funding_target),
    funding_raised: toCrore(row.funding_raised),
  };
}

/**
 * List projects. Pass `builderId` to scope to one builder; pass `authed` so the
 * request carries the access token (required for a builder to see their own
 * non-active statuses — anonymous callers only ever get active/completed).
 */
export function useProjects({ builderId, authed = false, enabled = true } = {}) {
  const { authedFetch } = useAuth();
  const [projects, setProjects] = useState(null);
  const [error, setError]       = useState(null);

  const path = `/api/v1/projects?limit=50${builderId ? `&builder_id=${builderId}` : ''}`;

  useEffect(() => {
    if (!enabled) { setProjects([]); return undefined; }
    let cancelled = false;
    const req = authed ? authedFetch(path) : cachedFetch(path, {}, { ttl: 60_000 });
    req
      .then((json) => {
        if (cancelled) return;
        setProjects((json?.data?.projects || []).map(shapeProject));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || 'Could not load projects.');
        setProjects([]);
      });
    return () => { cancelled = true; };
    // authedFetch is stable (useCallback in AuthContext).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, authed, enabled]);

  return { projects, loading: projects === null, error };
}

/** Fetch a single project by slug or UUID. */
export function useProject(id) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!id) return undefined;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setProject(null);
    cachedFetch(`/api/v1/projects/${encodeURIComponent(id)}`, {}, { ttl: 60_000 })
      .then((json) => {
        if (cancelled) return;
        setProject(shapeProject(json.data.project));
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || 'Could not load project.');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  return { project, loading, error };
}
