import { query } from "../_generated/server";
import { v } from "convex/values";

export const getByClerkUserId = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const teacher = await ctx.db
      .query("teachers")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();
    return teacher;
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("teachers").collect();
  },
});
