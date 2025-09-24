import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listRooms = query({
  args: {},
  handler: async (ctx) => {
    const rooms = await ctx.db.query("rooms").collect();
    
    const roomsWithPlayerCount = await Promise.all(
      rooms.map(async (room) => {
        const memberships = await ctx.db
          .query("roomMemberships")
          .withIndex("by_room", (q) => q.eq("roomId", room._id))
          .collect();
        
        const creator = await ctx.db.get(room.createdBy);
        
        return {
          ...room,
          playerCount: memberships.length,
          creatorName: creator?.name || "Unknown",
        };
      })
    );
    
    return roomsWithPlayerCount;
  },
});

export const createRoom = mutation({
  args: { name: v.string(), createdBy: v.id("players") },
  handler: async (ctx, args) => {
    const existingRoom = await ctx.db
      .query("rooms")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();

    if (existingRoom) {
      throw new Error("Room with this name already exists");
    }

    const roomId = await ctx.db.insert("rooms", {
      name: args.name,
      createdBy: args.createdBy,
      isGameStarted: false,
    });

    // Automatically join the creator to the room
    await ctx.db.insert("roomMemberships", {
      roomId,
      playerId: args.createdBy,
      isReady: false,
      joinedAt: Date.now(),
    });

    return roomId;
  },
});

export const joinRoom = mutation({
  args: { roomId: v.id("rooms"), playerId: v.id("players") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    if (room.isGameStarted) {
      throw new Error("Game has already started");
    }

    const existingMembership = await ctx.db
      .query("roomMemberships")
      .withIndex("by_room_and_player", (q) => 
        q.eq("roomId", args.roomId).eq("playerId", args.playerId)
      )
      .unique();

    if (existingMembership) {
      throw new Error("Player is already in this room");
    }

    await ctx.db.insert("roomMemberships", {
      roomId: args.roomId,
      playerId: args.playerId,
      isReady: false,
      joinedAt: Date.now(),
    });
  },
});

export const leaveRoom = mutation({
  args: { roomId: v.id("rooms"), playerId: v.id("players") },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("roomMemberships")
      .withIndex("by_room_and_player", (q) => 
        q.eq("roomId", args.roomId).eq("playerId", args.playerId)
      )
      .unique();

    if (membership) {
      await ctx.db.delete(membership._id);
    }

    // Check if room is empty and delete it
    const remainingMemberships = await ctx.db
      .query("roomMemberships")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    if (remainingMemberships.length === 0) {
      await ctx.db.delete(args.roomId);
    }
  },
});

export const getRoomDetails = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) {
      return null;
    }

    const memberships = await ctx.db
      .query("roomMemberships")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    const playersInRoom = await Promise.all(
      memberships.map(async (membership) => {
        const player = await ctx.db.get(membership.playerId);
        return {
          ...player,
          isReady: membership.isReady,
          membershipId: membership._id,
        };
      })
    );

    const creator = await ctx.db.get(room.createdBy);

    return {
      ...room,
      players: playersInRoom,
      creatorName: creator?.name || "Unknown",
    };
  },
});

export const toggleReady = mutation({
  args: { roomId: v.id("rooms"), playerId: v.id("players") },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("roomMemberships")
      .withIndex("by_room_and_player", (q) => 
        q.eq("roomId", args.roomId).eq("playerId", args.playerId)
      )
      .unique();

    if (!membership) {
      throw new Error("Player is not in this room");
    }

    await ctx.db.patch(membership._id, {
      isReady: !membership.isReady,
    });
  },
});

export const startGame = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    const memberships = await ctx.db
      .query("roomMemberships")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    // Check if all players are ready
    const allReady = memberships.every(membership => membership.isReady);
    if (!allReady || memberships.length === 0) {
      throw new Error("Not all players are ready");
    }

    await ctx.db.patch(args.roomId, {
      isGameStarted: true,
    });
  },
});
