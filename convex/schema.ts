import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  players: defineTable({
    name: v.string(),
    isOnline: v.boolean(),
    lastSeen: v.number(),
    sessionId: v.optional(v.string()),
  }).index("by_name", ["name"])
    .index("by_session", ["sessionId"]),

  rooms: defineTable({
    name: v.string(),
    createdBy: v.id("players"),
    isGameStarted: v.boolean(),
    maxPlayers: v.optional(v.number()),
  }).index("by_name", ["name"]),

  roomMemberships: defineTable({
    roomId: v.id("rooms"),
    playerId: v.id("players"),
    isReady: v.boolean(),
    joinedAt: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_player", ["playerId"])
    .index("by_room_and_player", ["roomId", "playerId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
