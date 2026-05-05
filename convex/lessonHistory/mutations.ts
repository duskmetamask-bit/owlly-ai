import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

export const saveLessonPlan = mutation({
  args: {
    teacherId: v.id("teachers"),
    sessionId: v.optional(v.id("sessions")),
    title: v.string(),
    content: v.string(),
    yearLevel: v.optional(v.string()),
    subject: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("lessonHistory", {
      teacherId: args.teacherId,
      sessionId: args.sessionId ?? undefined,
      type: "lesson_plan",
      title: args.title,
      content: args.content,
      yearLevel: args.yearLevel ?? undefined,
      subject: args.subject ?? undefined,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const saveUnitPlan = mutation({
  args: {
    teacherId: v.id("teachers"),
    title: v.string(),
    content: v.string(),
    yearLevel: v.optional(v.string()),
    subject: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("lessonHistory", {
      teacherId: args.teacherId,
      type: "other",
      title: args.title,
      content: args.content,
      yearLevel: args.yearLevel ?? undefined,
      subject: args.subject ?? undefined,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const saveRubric = mutation({
  args: {
    teacherId: v.id("teachers"),
    sessionId: v.optional(v.id("sessions")),
    title: v.string(),
    content: v.string(),
    yearLevel: v.optional(v.string()),
    subject: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("lessonHistory", {
      teacherId: args.teacherId,
      sessionId: args.sessionId ?? undefined,
      type: "rubric",
      title: args.title,
      content: args.content,
      yearLevel: args.yearLevel ?? undefined,
      subject: args.subject ?? undefined,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const saveAssessment = mutation({
  args: {
    teacherId: v.id("teachers"),
    sessionId: v.optional(v.id("sessions")),
    title: v.string(),
    content: v.string(),
    yearLevel: v.optional(v.string()),
    subject: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("lessonHistory", {
      teacherId: args.teacherId,
      sessionId: args.sessionId ?? undefined,
      type: "assessment",
      title: args.title,
      content: args.content,
      yearLevel: args.yearLevel ?? undefined,
      subject: args.subject ?? undefined,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const deleteItem = mutation({
  args: {
    id: v.id("lessonHistory"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
