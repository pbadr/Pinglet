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

  const rooms: Map<string, string[]> = new Map();
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

      // Remove user from room
      users.delete(socket.id);

      // If only one user left in room, delete room
      if (rooms.get(roomId)!.length === 1) {
        console.log(`[!] Room ${roomId} deleted`);
        rooms.delete(roomId);
        return;
      }

      rooms.set(roomId, rooms.get(roomId)!.filter((id) => id !== socket.id));
    });
    
    // Create room
    socket.on('create-room', () => {
      console.log(`Room created by ${socket.id}`);
      socket.join(socket.id);

      rooms.set(socket.id, [socket.id]);
      users.set(socket.id, socket.id);

      socket.emit('room-created', socket.id);
    });

    // Join room
    socket.on('join-room', (roomId) => {
      if (!rooms.has(roomId)) {
        console.log(`[!] ${socket.id} tried to join non-existent room ${roomId}`);
        socket.emit('room-not-found', roomId);

        return;
      }

      socket.join(roomId);
      console.log(`[+] ${socket.id} joined room ${roomId}`);

      rooms.get(roomId)!.push(socket.id);
      users.set(socket.id, roomId);

      console.log(rooms.get(roomId));
      const roomInfo = {
        roomId,
        usersConnected: rooms.get(roomId)!.length
      } as RoomInfo;
      
      io.to(roomId).emit('user-joined', roomInfo);
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
      const averagePing = getAverageBestPing(clientPings);


      // Convert Map to object
      const averagePingObject: { [key: string]: number } = {};
      averagePing.forEach((value, key) => {
        averagePingObject[key] = value;
      });
      
      io.to(roomId).emit('best-ping', averagePingObject);
    });
  });
}
