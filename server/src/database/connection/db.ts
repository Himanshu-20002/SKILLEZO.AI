import mongoose from "mongoose";
import dns from "dns";
import { env } from "@/core/config/env";

// Configure reliable DNS servers for SRV record resolution (prevents ISP/Local DNS querySrv ECONNREFUSED)
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
  }
} catch (dnsErr) {
  console.warn("[DB] Could not set custom DNS servers, using default OS DNS settings");
}

let isEventListenersRegistered = false;

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
    await mongoose.connect(env.MONGODB_URI);
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
