"use client";

import { useSyncExternalStore } from "react";

/**
 * Favoritos del cliente (el corazón de las tarjetas).
 * Se guardan en el navegador, igual que el carrito.
 */
const STORAGE_KEY = "mia-store-favorites";
const EMPTY: string[] = [];

let cache: string[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : EMPTY;
    cache = Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : EMPTY;
  } catch {
    cache = EMPTY;
  }
}

function commit(next: string[]) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // sin almacenamiento: los favoritos siguen funcionando mientras la página esté abierta
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  load();
  return cache;
}

function getServerSnapshot() {
  return EMPTY;
}

export function toggleFavorite(slug: string) {
  load();
  commit(cache.includes(slug) ? cache.filter((s) => s !== slug) : [...cache, slug]);
}

export function useFavorites() {
  const slugs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { slugs, has: (slug: string) => slugs.includes(slug) };
}
