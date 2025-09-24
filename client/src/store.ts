import { toast } from "sonner";
import { create } from "zustand";
import type { AppState, Room } from "../../shared/types/main-types";
import { socket } from "./socket";

// --- Data Types (can be shared with backend) ---

export const useStore = create<AppState>((set, get) => ({
  room: null,
  setRoom: (room) => set({ room }),
  createRoom: (name) => {
    socket.emit("createRoom", { name });
  },
  joinRoom: (roomId, name) => {
    socket.emit("joinRoom", { roomId, name });
  },
  setReady: (isReady) => {
    const roomId = get().room?.id;
    if (roomId) {
      socket.emit("setReady", { roomId, isReady });
    }
  },
}));

// --- Socket Event Listeners ---
socket.on("roomUpdate", (room: Room) => {
  useStore.getState().setRoom(room);
});

socket.on("error", (error: { message: string }) => {
  toast.error(`An error occurred: ${error.message}`);
});
