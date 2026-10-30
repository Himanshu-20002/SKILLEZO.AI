import dns from "dns";
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
  }
} catch {
  // Use default OS settings
}

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

/**
 * Creates (or promotes + resets the password of) an administrator account.
 *
 * Usage:
 *   ADMIN_EMAIL=admin@yourdomain.com ADMIN_PASSWORD='Strong#Pass1' npm run seed:admin
 *
 * Runs against whatever MONGODB_URI is set, so point it at production to fix production.
 */
async function main() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  const name = process.env.ADMIN_NAME || "Administrator";

  if (!email || password.length < 8) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (min 8 chars) before running seed:admin.");
  }
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set.");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`[seed:admin] Connected to database "${mongoose.connection.name}"`);

  // Imported after connect: getAuth() requires an open mongoose connection.
  const { getAuth } = await import("../core/auth/auth");
  const ctx = await getAuth().$context;
  const hash = await ctx.password.hash(password);

  const existing = await ctx.internalAdapter.findUserByEmail(email, { includeAccounts: true });

  if (existing?.user) {
    const userId = existing.user.id;
    await ctx.internalAdapter.updateUser(userId, {
      role: "admin",
      accountStatus: "active",
      emailVerified: true,
    });
    const hasCredential = existing.accounts?.some((a: any) => a.providerId === "credential");
    if (hasCredential) {
      await ctx.internalAdapter.updatePassword(userId, hash);
    } else {
      await ctx.internalAdapter.linkAccount({
        userId,
        providerId: "credential",
        accountId: userId,
        password: hash,
      });
    }
    console.log(`[seed:admin] Updated existing user ${email}: role=admin, password reset.`);
  } else {
    const user = await ctx.internalAdapter.createUser({
      email,
      name,
      emailVerified: true,
      role: "admin",
      accountStatus: "active",
    });
    await ctx.internalAdapter.linkAccount({
      userId: user.id,
      providerId: "credential",
      accountId: user.id,
      password: hash,
    });
    console.log(`[seed:admin] Created admin user ${email}.`);
  }
}

main()
  .catch((err) => {
    console.error("[seed:admin] Failed:", err?.message || err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
