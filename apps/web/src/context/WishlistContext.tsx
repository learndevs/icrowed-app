"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { createClient } from "@/lib/supabase/client";

const STORAGE_KEY = "icrowed_wishlist";

interface WishlistState {
  ids: Set<string>;
  synced: boolean;
}

type Action =
  | { type: "SET"; ids: string[] }
  | { type: "ADD"; id: string }
  | { type: "REMOVE"; id: string }
  | { type: "SYNCED" };

function reducer(state: WishlistState, action: Action): WishlistState {
  switch (action.type) {
    case "SET":
      return { ids: new Set(action.ids), synced: state.synced };
    case "ADD": {
      const next = new Set(state.ids);
      next.add(action.id);
      return { ...state, ids: next };
    }
    case "REMOVE": {
      const next = new Set(state.ids);
      next.delete(action.id);
      return { ...state, ids: next };
    }
    case "SYNCED":
      return { ...state, synced: true };
    default:
      return state;
  }
}

interface WishlistContextValue {
  ids: Set<string>;
  toggle: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { ids: new Set<string>(), synced: false });
  const userIdRef = useRef<string | null>(null);

  // Load from localStorage + sync with server on mount
  useEffect(() => {
    const local = loadLocal();
    if (local.length > 0) dispatch({ type: "SET", ids: local });

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      userIdRef.current = uid;
      if (uid) {
        try {
          const res = await fetch("/api/wishlist");
          if (res.ok) {
            const { productIds } = await res.json() as { productIds: string[] };
            // Merge local + server
            const merged = Array.from(new Set([...local, ...productIds]));
            dispatch({ type: "SET", ids: merged });
            // Persist merged back to local
            saveLocal(merged);
            // Push any local-only items to server
            const serverSet = new Set(productIds);
            for (const id of local) {
              if (!serverSet.has(id)) {
                fetch("/api/wishlist", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ productId: id }),
                }).catch(() => null);
              }
            }
          }
        } catch {
          // silently fail — use local state
        }
      }
      dispatch({ type: "SYNCED" });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      userIdRef.current = session?.user?.id ?? null;
      if (event === "SIGNED_OUT") {
        dispatch({ type: "SET", ids: [] });
        saveLocal([]);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const toggle = useCallback(async (productId: string) => {
    const alreadyIn = state.ids.has(productId);
    const uid = userIdRef.current;

    if (alreadyIn) {
      dispatch({ type: "REMOVE", id: productId });
      const next = Array.from(state.ids).filter((x) => x !== productId);
      saveLocal(next);
      if (uid) {
        fetch(`/api/wishlist/${productId}`, { method: "DELETE" }).catch(() => null);
      }
    } else {
      dispatch({ type: "ADD", id: productId });
      const next = [...Array.from(state.ids), productId];
      saveLocal(next);
      if (uid) {
        fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        }).catch(() => null);
      }
    }
  }, [state.ids]);

  return (
    <WishlistContext.Provider
      value={{
        ids: state.ids,
        toggle,
        isWishlisted: (id) => state.ids.has(id),
        count: state.ids.size,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}

function loadLocal(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(raw) ? (raw as string[]) : [];
  } catch {
    return [];
  }
}

function saveLocal(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}
