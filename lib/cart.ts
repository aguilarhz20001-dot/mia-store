"use client";

import { useSyncExternalStore } from "react";

export type CartItem = {
  slug: string;
  qty: number;
  size?: string;
};

const STORAGE_KEY = "mia-store-cart";
const EMPTY: CartItem[] = [];

let cache: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as CartItem[]) : EMPTY;
  } catch {
    cache = EMPTY;
  }
}

function commit(next: CartItem[]) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // almacenamiento no disponible: el carrito sigue funcionando en memoria
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

const sameLine = (a: CartItem, slug: string, size?: string) =>
  a.slug === slug && a.size === size;

export function addToCart(slug: string, qty = 1, size?: string) {
  load();
  const exists = cache.some((i) => sameLine(i, slug, size));
  commit(
    exists
      ? cache.map((i) => (sameLine(i, slug, size) ? { ...i, qty: i.qty + qty } : i))
      : [...cache, { slug, qty, size }],
  );
}

export function setQty(slug: string, qty: number, size?: string) {
  load();
  commit(
    qty <= 0
      ? cache.filter((i) => !sameLine(i, slug, size))
      : cache.map((i) => (sameLine(i, slug, size) ? { ...i, qty } : i)),
  );
}

export function removeFromCart(slug: string, size?: string) {
  setQty(slug, 0, size);
}

export function clearCart() {
  load();
  commit(EMPTY);
}

export function useCart() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const count = items.reduce((n, i) => n + i.qty, 0);
  return { items, count };
}
