import { createAuthClient } from "better-auth/react";

const getBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!envUrl) return "http://localhost:5000";
  if (envUrl.startsWith("http://") || envUrl.startsWith("https://")) {
    return envUrl;
  }
  return `https://${envUrl}`;
};

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
});

export const { signIn, signUp, signOut, useSession } = authClient;

