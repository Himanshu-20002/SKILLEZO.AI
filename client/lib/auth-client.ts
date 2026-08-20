import { createAuthClient } from "better-auth/react";

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
        const token = localStorage.getItem("skillezo_token");
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
          const clone = context.response.clone();
          clone.json().then((data) => {
            if (data?.token) {
              localStorage.setItem("skillezo_token", data.token);
            } else if (data?.session?.token) {
              localStorage.setItem("skillezo_token", data.session.token);
            }
          }).catch(() => {});
        } catch (_) {}
      }
    },
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;

