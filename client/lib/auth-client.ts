import { createAuthClient } from "better-auth/react";

// Capture token immediately upon script evaluation if user just landed from OAuth redirect
if (typeof window !== "undefined") {
  try {
    const params = new URLSearchParams(window.location.search);
    const incomingToken =
      params.get("bearer_token") ||
      params.get("skillezo_token") ||
      params.get("token");

    if (incomingToken) {
      localStorage.setItem("skillezo_token", incomingToken);
      document.cookie = `skillezo_token=${encodeURIComponent(incomingToken)}; path=/; max-age=2592000; SameSite=Lax`;
    }
  } catch {}
}

const getBaseUrl = () => {
  let envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  
  if (typeof window !== "undefined") {
    if (!envUrl || envUrl === "/" || envUrl === window.location.origin) {
      return window.location.origin;
    }
  }

  if (!envUrl) return "http://localhost:5000";
  if (!envUrl.startsWith("http://") && !envUrl.startsWith("https://")) {
    envUrl = `https://${envUrl}`;
  }
  envUrl = envUrl.replace(/\/+$/, "");
  if (envUrl.endsWith("/api/auth")) {
    envUrl = envUrl.replace(/\/api\/auth$/, "");
  } else if (envUrl.endsWith("/api")) {
    envUrl = envUrl.replace(/\/api$/, "");
  }
  return envUrl;
};

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  fetchOptions: {
    credentials: "include",
    onRequest(context) {
      if (typeof window !== "undefined") {
        let token = localStorage.getItem("skillezo_token");
        if (!token) {
          try {
            const params = new URLSearchParams(window.location.search);
            token =
              params.get("bearer_token") ||
              params.get("skillezo_token") ||
              params.get("token");
            if (token) {
              localStorage.setItem("skillezo_token", token);
              document.cookie = `skillezo_token=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax`;
            }
          } catch {}
        }

        if (token) {
          if (context.headers instanceof Headers) {
            context.headers.set("Authorization", `Bearer ${token}`);
          } else if (context.headers && typeof context.headers === "object") {
            (context.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
          } else {
            context.headers = new Headers({ Authorization: `Bearer ${token}` });
          }
        }
      }
    },
    onResponse(context) {
      if (typeof window !== "undefined" && context.response) {
        try {
          const authToken =
            context.response.headers.get("set-auth-token") ||
            context.response.headers.get("x-auth-session-token");
          if (authToken) {
            localStorage.setItem("skillezo_token", authToken);
            document.cookie = `skillezo_token=${encodeURIComponent(authToken)}; path=/; max-age=2592000; SameSite=Lax`;
          }

          const clone = context.response.clone();
          clone.json().then((data) => {
            const receivedToken = data?.token || data?.session?.token;
            if (receivedToken) {
              localStorage.setItem("skillezo_token", receivedToken);
              document.cookie = `skillezo_token=${encodeURIComponent(receivedToken)}; path=/; max-age=2592000; SameSite=Lax`;
            }
          }).catch(() => {});
        } catch (_) {}
      }
    },
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;
