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
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;

