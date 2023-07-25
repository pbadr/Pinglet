import type { RoomInfo } from '$lib/types';
import { Server } from 'socket.io';

import { getAverageBestPing } from './utils';
import type { PingInformation } from './utils';

export default function socketHandler(server: any) {
  const io = new Server(server, {
    cors: {
      origin: 'http://127.0.0.1:5173'
    }
  });
  console.log("WebSocket server started");

  const rooms: Map<string, RoomInfo> = new Map();
  const users: Map<string, string> = new Map();
  
  /*
  Pings are roomIds => clientIds => PingInformation[]
  {
    roomId: {
      clientId: [...],
      clientId2: [...]
    },
    roomId2: {
      clientId: [...],
      clientId2: [...]
    }
  }
  */
  const pings = new Map<string, Map<string, PingInformation[]>>();
  
  io.on('connection', (socket) => {

    console.log('[+] User connected', socket.id);

    // User disconnect
    socket.on('disconnect', () => {
      console.log('[-] User disconnected', socket.id);
      if (!users.has(socket.id))
        return;
      
      // Broadcast to all users in room about user disconnection
      const roomId = users.get(socket.id) as string;
      io.to(roomId).emit('user-left', socket.id);

      // Remove user from users map
      users.delete(socket.id);

      // If only one user left in room, delete room
      if (rooms.get(roomId)?.totalUsers === 1) {
        console.log(`[!] Room ${roomId} deleted`);
        rooms.delete(roomId);
        return;
      }

      const newConnectedUsers = rooms.get(roomId)?.usersConnected.filter((userId) => userId !== socket.id);
      const room: RoomInfo = {
        ...rooms.get(roomId)!,
        usersConnected: newConnectedUsers!,
        totalUsers: newConnectedUsers!.length
      }

      console.log(room);
      rooms.set(roomId, room);
    });
    
    // Create room
    socket.on('create-room', () => {
      console.log(`Room created by ${socket.id}`);
      socket.join(socket.id);

      const roomInfo: RoomInfo = {
        roomOwnerId: socket.id,
        roomId: socket.id,
        usersConnected: [socket.id],
        totalUsers: 1
      }

      rooms.set(socket.id, roomInfo);
      users.set(socket.id, socket.id);

      
      socket.emit('room-created', roomInfo);
    });

    // Join room
    socket.on('join-room', (roomId) => {
      if (!rooms.has(roomId)) {
        console.log(`[!] ${socket.id} tried to join non-existent room ${roomId}`);
        socket.emit('room-not-found', roomId);

        return;
      }

      const room = rooms.get(roomId)!;
      socket.join(room.roomId);
      console.log(`[+] ${socket.id} joined room ${room.roomId}`);

      const updatedRoom = {
        ...room,
        usersConnected: [...room.usersConnected, socket.id],
        totalUsers: room.totalUsers + 1
      } as RoomInfo;
      rooms.set(roomId, updatedRoom);

      console.log(updatedRoom);

      users.set(socket.id, roomId);
      io.to(roomId).emit('user-joined', updatedRoom);
    });

    // Ping information from client
    socket.on('ping', (pingInformationFromClient: PingInformation[]) => {
      // Get room of socket
      const roomId = users.get(socket.id) as string;

      // Get all previous clients in room with their pings
      const previousClients = pings.get(roomId) || new Map<string, PingInformation[]>();
      
      // Add new client with their pings
      pings.set(roomId, new Map<string, PingInformation[]>([...previousClients, [socket.id, pingInformationFromClient]]));
    });

    // Get best ping for clients
    socket.on('get-best-ping', () => {
      const roomId = users.get(socket.id) as string;
      const clientPings = pings.get(roomId) || new Map<string, PingInformation[]>();
      const bestAveragePing = getAverageBestPing(clientPings);


      // Convert Map to array of objects
      const bestAveragePingArray = Array.from(bestAveragePing, ([serverName, averagePing]) => ({ serverName, averagePing }));
      console.log(bestAveragePingArray);
      io.to(roomId).emit('best-ping', bestAveragePingArray);
    });

    socket.on('notify-ping', (roomId: string) => {
      io.to(roomId).emit('ping-started');
    });

    socket.on('update-ping', (roomId: string, userId: string) => {
      io.to(roomId).emit('ping-updated', userId);
    });
  });
}
