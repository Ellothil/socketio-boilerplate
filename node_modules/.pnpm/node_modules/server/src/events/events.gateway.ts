import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import type { Room } from "@shared/types/main-types";
import type { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: "*", // Allow connections from any origin (adjust for production)
  },
})
export class EventsGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // In-memory storage for rooms. Use Redis or a DB in production.
  private rooms: Map<string, Room> = new Map();
  private readonly roomTTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  // --- Helper Functions ---

  private broadcastRoomUpdate(roomId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      // Send the full room state to everyone in that room
      const publicRoom = {
        id: room.id,
        hostId: room.hostId,
        players: room.players,
      };
      this.server.to(roomId).emit("roomUpdate", publicRoom);
    }
  }

  private scheduleRoomCleanup(roomId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      // Clear any existing timeout
      if (room.timeoutId) {
        clearTimeout(room.timeoutId);
      }
      // Set a new timeout
      room.timeoutId = setTimeout(() => {
        console.log(`Room ${roomId} is empty and has expired. Deleting.`);
        this.rooms.delete(roomId);
      }, this.roomTTL);
    }
  }

  // --- Gateway Lifecycle Hooks ---

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Find which room the player was in
    let roomIdToUpdate: string | null = null;
    for (const [roomId, room] of this.rooms.entries()) {
      const playerIndex = room.players.findIndex((p) => p.id === client.id);
      if (playerIndex > -1) {
        // Remove the player
        room.players.splice(playerIndex, 1);
        roomIdToUpdate = roomId;

        // If the room is now empty, schedule its deletion
        if (room.players.length === 0) {
          this.scheduleRoomCleanup(roomId);
          break;
        }

        // Host migration logic
        if (room.hostId === client.id) {
          // Sort players by join time (oldest first)
          const newHost = room.players.sort(
            (a, b) => a.joinedAt - b.joinedAt
          )[0];
          room.hostId = newHost.id;
          console.log(
            `Host disconnected. New host in room ${roomId} is ${newHost.name}`
          );
        }
        break;
      }
    }

    if (roomIdToUpdate) {
      this.broadcastRoomUpdate(roomIdToUpdate);
    }
  }

  // --- Socket Event Handlers ---

  @SubscribeMessage("createRoom")
  handleCreateRoom(
    @MessageBody() data: { name: string },
    @ConnectedSocket() client: Socket
  ): void {
    const { name } = data;
    // Generate a simple 4-digit room ID
    const roomId = Math.random().toString().substring(2, 6);

    const newPlayer: Player = {
      id: client.id,
      name,
      isReady: false,
      joinedAt: Date.now(),
    };

    const newRoom: Room = {
      id: roomId,
      hostId: client.id,
      players: [newPlayer],
    };

    this.rooms.set(roomId, newRoom);
    client.join(roomId);
    this.broadcastRoomUpdate(roomId);
    console.log(
      `Player ${name} (${client.id}) created and joined room ${roomId}`
    );
  }

  @SubscribeMessage("joinRoom")
  handleJoinRoom(
    @MessageBody() data: { roomId: string; name: string },
    @ConnectedSocket() client: Socket
  ): void {
    const { roomId, name } = data;
    const room = this.rooms.get(roomId);

    if (!room) {
      client.emit("error", { message: "Room not found." });
      return;
    }

    if (room.players.length >= 8) {
      client.emit("error", { message: "Room is full." });
      return;
    }

    // Clear the cleanup timeout if someone joins
    if (room.timeoutId) {
      clearTimeout(room.timeoutId);
      room.timeoutId = undefined;
    }

    const newPlayer: Player = {
      id: client.id,
      name,
      isReady: false,
      joinedAt: Date.now(),
    };

    room.players.push(newPlayer);
    client.join(roomId);
    this.broadcastRoomUpdate(roomId);
    console.log(`Player ${name} (${client.id}) joined room ${roomId}`);
  }

  @SubscribeMessage("setReady")
  handleSetReady(
    @MessageBody() data: { roomId: string; isReady: boolean },
    @ConnectedSocket() client: Socket
  ): void {
    const { roomId, isReady } = data;
    const room = this.rooms.get(roomId);
    if (room) {
      const player = room.players.find((p) => p.id === client.id);
      if (player) {
        player.isReady = isReady;
        this.broadcastRoomUpdate(roomId);
        console.log(
          `Player ${player.name} in room ${roomId} set ready status to ${isReady}`
        );
      }
    }
  }
}
