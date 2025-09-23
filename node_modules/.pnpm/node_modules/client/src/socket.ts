import { io } from 'socket.io-client';

// During development, the Vite proxy will handle this.
// In production, the server will serve the client, so the origin is the same.
export const socket = io();