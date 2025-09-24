export type Player = {
  id: string;
  name: string;
  isReady: boolean;
  joinedAt: number;
};

export type Room = {
  id: string;
  hostId: string;
  players: Player[];
};

export type AppState = {
  room: Room | null;
  setRoom: (room: Room | null) => void;
  createRoom: (name: string) => void;
  joinRoom: (roomId: string, name: string) => void;
  setReady: (isReady: boolean) => void;
};
