import { create } from 'zustand';
import { socket } from './socket';

// --- Data Types (can be shared with backend) ---
interface Player {
    id: string;
    name: string;
    isReady: boolean;
    joinedAt: number;
}

interface Room {
    id: string;
    hostId: string;
    players: Player[];
}

// --- Store State and Actions ---
interface AppState {
    room: Room | null;
    setRoom: (room: Room | null) => void;
    createRoom: (name: string) => void;
    joinRoom: (roomId: string, name: string) => void;
    setReady: (isReady: boolean) => void;
}

export const useStore = create<AppState>((set, get) => ({
    room: null,
    setRoom: (room) => set({ room }),
    createRoom: (name) => {
        socket.emit('createRoom', { name });
    },
    joinRoom: (roomId, name) => {
        socket.emit('joinRoom', { roomId, name });
    },
    setReady: (isReady) => {
        const roomId = get().room?.id;
        if (roomId) {
            socket.emit('setReady', { roomId, isReady });
        }
    },
}));

// --- Socket Event Listeners ---
socket.on('roomUpdate', (room: Room) => {
    useStore.getState().setRoom(room);
});

socket.on('error', (error: { message: string }) => {
    alert(`An error occurred: ${error.message}`);
});