import mongoose from "mongoose";
import { connectDatabase, disconnectDatabase } from "@/database/connection/db";
import { planService } from "@/modules/plan/plan.service";

async function runBackfill() {
  console.log("==================================================");
  console.log("🚀 Starting Free Plan & Token Allowance Backfill");
  console.log("==================================================");

  try {
    await connectDatabase();

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("MongoDB database instance not found.");
    }

    const users = await db.collection("user").find({}).toArray();
    console.log(`[Backfill] Found ${users.length} total users in collection.`);

    let provisionedCount = 0;
    let existingCount = 0;

    for (const user of users) {
      const userId = user.id || user._id?.toString();
      if (!userId) continue;

      try {
        const { tokenAccount } = await planService.getOrCreateAccount(userId);
        if (tokenAccount.consumedTokens === 0 && tokenAccount.remainingTokens === 5000) {
          provisionedCount++;
        } else {
          existingCount++;
        }
      } catch (err: any) {
        console.error(`[Backfill] Error processing user ${userId}:`, err?.message || err);
      }
    }

    console.log("--------------------------------------------------");
    console.log(`✅ Backfill complete!`);
    console.log(`- New provisioned accounts (5,000 Free tokens): ${provisionedCount}`);
    console.log(`- Existing accounts maintained: ${existingCount}`);
    console.log("==================================================");
  } catch (error) {
    console.error("[Backfill Fatal Error]:", error);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
}

if (require.main === module) {
  runBackfill();
}
