import mongoose from "mongoose";
import { env } from "@/core/config/env";

// Use the operating system DNS resolver. It can resolve the Atlas SRV records
// on this machine, while the previously hard-coded public DNS servers time out.

let isEventListenersRegistered = false;

function getDatabaseUri(): string {
  const { MONGODB_URI, MONGODB_DIRECT_HOSTS, MONGODB_REPLICA_SET } = env;

  if (!MONGODB_DIRECT_HOSTS || !MONGODB_REPLICA_SET || !MONGODB_URI.startsWith("mongodb+srv://")) {
    return MONGODB_URI;
  }

  // Local networks may block Node's DNS SRV lookups even when direct Atlas
  // hosts are reachable. The credentials and database name remain in the
  // existing MONGODB_URI; only the SRV hostname is replaced.
  const hostMatch = MONGODB_URI.match(/^mongodb\+srv:\/\/(?:.*@)?([^/?]+)/);
  if (!hostMatch) return MONGODB_URI;

  const directUri = MONGODB_URI
    .replace(/^mongodb\+srv:\/\//, "mongodb://")
    .replace(hostMatch[1], MONGODB_DIRECT_HOSTS);

  const separator = directUri.includes("?") ? "&" : "?";
  return `${directUri}${separator}tls=true&replicaSet=${encodeURIComponent(MONGODB_REPLICA_SET)}&authSource=admin`;
}

function registerEventListeners(): void {
  if (isEventListenersRegistered) return;

  mongoose.connection.on("connected", () => {
    console.log("[DB] MongoDB connected");
  });

  mongoose.connection.on("disconnected", () => {
    console.log("[DB] MongoDB disconnected");
  });

  mongoose.connection.on("error", (err: Error) => {
    console.error("[DB] MongoDB connection error:", err.message);
  });

  isEventListenersRegistered = true;
}

export async function connectDatabase(): Promise<typeof mongoose> {
  const currentState = mongoose.connection.readyState;

  // Ready states: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (currentState === 1) {
    return mongoose;
  }

  if (currentState === 2) {
    console.log("[DB] MongoDB connection attempt already in progress...");
    return new Promise((resolve, reject) => {
      mongoose.connection.once("connected", () => resolve(mongoose));
      mongoose.connection.once("error", (err) => reject(err));
    });
  }

  registerEventListeners();

  try {
    console.log("[DB] Connecting to MongoDB...");
    await mongoose.connect(getDatabaseUri());
    return mongoose;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown database connection error";
    console.error("[DB] Failed to connect to MongoDB:", message);
    throw new Error("Database connection failure");
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    console.log("[DB] Closing MongoDB connection...");
    await mongoose.connection.close();
  }
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
