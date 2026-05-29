/*
 * useFilter.js — Generic client-side filter and search hook.
 *
 * Accepts a full items array and a map of named filter functions. Maintains
 * filter values and a text search string in local state. Returns a memoized
 * filtered array, the current search string, a setSearch setter, the current
 * filter values map, and a setFilter(key, value) updater. Used to reduce
 * boilerplate across directory pages that need search + multi-filter logic.
 */
import { useState, useMemo } from 'react';

/**
 * Generic client-side filter hook.
 * @param {Array}  items       - Full dataset.
 * @param {object} filterFns   - { key: (item, value) => bool }
 */
export default function useFilter(items, filterFns) {
  const [filters, setFilters] = useState({});
  const [search, setSearch]   = useState('');

  const filtered = useMemo(() => {
    return items.filter((item) => {
      // text search
      if (search) {
        const s = search.toLowerCase();
        const text = Object.values(item).join(' ').toLowerCase();
        if (!text.includes(s)) return false;
      }
      // custom filter functions
      for (const [key, fn] of Object.entries(filterFns)) {
        const value = filters[key];
        if (value && !fn(item, value)) return false;
      }
      return true;
    });
  }, [items, search, filters, filterFns]);

  function setFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  return { filtered, search, setSearch, filters, setFilter };
}
