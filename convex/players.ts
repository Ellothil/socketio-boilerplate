import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listPlayers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("players").collect();
  },
});

export const createOrSelectPlayer = mutation({
  args: { name: v.string(), sessionId: v.string() },
  handler: async (ctx, args) => {
    const existingPlayer = await ctx.db
      .query("players")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();

    if (existingPlayer) {
      // Check if player is already in use by another session
      if (existingPlayer.sessionId && existingPlayer.sessionId !== args.sessionId && existingPlayer.isOnline) {
        throw new Error("This player is already in use by another client");
      }

      // Update the player with new session
      await ctx.db.patch(existingPlayer._id, {
        isOnline: true,
        lastSeen: Date.now(),
        sessionId: args.sessionId,
      });
      return existingPlayer._id;
    }

    // Create new player
    return await ctx.db.insert("players", {
      name: args.name,
      isOnline: true,
      lastSeen: Date.now(),
      sessionId: args.sessionId,
    });
  },
});

export const releasePlayer = mutation({
  args: { playerId: v.id("players"), sessionId: v.string() },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) return;

    // Only release if this session owns the player
    if (player.sessionId === args.sessionId) {
      await ctx.db.patch(args.playerId, {
        isOnline: false,
        lastSeen: Date.now(),
        sessionId: undefined,
      });
    }
  },
});

export const updatePlayerStatus = mutation({
  args: { playerId: v.id("players"), isOnline: v.boolean(), sessionId: v.string() },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) return;

    // Only update if this session owns the player
    if (player.sessionId === args.sessionId) {
      await ctx.db.patch(args.playerId, {
        isOnline: args.isOnline,
        lastSeen: Date.now(),
      });
    }
  },
});

export const heartbeat = mutation({
  args: { playerId: v.id("players"), sessionId: v.string() },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) return;

    // Only update if this session owns the player
    if (player.sessionId === args.sessionId) {
      await ctx.db.patch(args.playerId, {
        lastSeen: Date.now(),
      });
    }
  },
});
