"use client";

import { useEffect } from "react";

function captureIncomingToken() {
  if (typeof window === "undefined") return;
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const token =
      searchParams.get("bearer_token") ||
      searchParams.get("skillezo_token") ||
      searchParams.get("token");

    if (token) {
      localStorage.setItem("skillezo_token", token);
      document.cookie = `skillezo_token=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax`;

      // Clean token query parameters from browser URL without triggering a page reload
      searchParams.delete("bearer_token");
      searchParams.delete("skillezo_token");
      searchParams.delete("token");

      const cleanSearch = searchParams.toString() ? `?${searchParams.toString()}` : "";
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}${cleanSearch}${window.location.hash}`
      );
    }
  } catch {}
}

// Execute synchronously at import/evaluation time if window is present
captureIncomingToken();

export function AuthTokenBridge() {
  // Execute during render/mount phase
  captureIncomingToken();

  useEffect(() => {
    captureIncomingToken();
  }, []);

  return null;
}

export default AuthTokenBridge;
