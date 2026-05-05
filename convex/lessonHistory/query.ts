import { query } from "../../_generated/server";
import { v } from "convex/values";

export const listForTeacher = query({
  args: {
    teacherId: v.id("teachers"),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("lessonHistory")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
      .collect();

    return items.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const listForTeacherByType = query({
  args: {
    teacherId: v.id("teachers"),
    type: v.union(
      v.literal("lesson_plan"),
      v.literal("rubric"),
      v.literal("assessment"),
      v.literal("feedback"),
      v.literal("report_comment"),
      v.literal("other")
    ),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("lessonHistory")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();

    return items
      .filter((item) => item.teacherId === args.teacherId)
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getById = query({
  args: {
    id: v.id("lessonHistory"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
