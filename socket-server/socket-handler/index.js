// @ts-nocheck
import { Server } from 'socket.io';

import { getAverageBestPing, getUserFromSocket } from './utils/index.js';

export default function socketHandler(server) {
  const io = new Server(server, {
    cors: {
      origin: 'http://127.0.0.1:5173'
    }
  });
  console.log("WebSocket server started");

  const rooms = new Map();
  const users = new Map();
  
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
  const pings = new Map();
  
  io.on('connection', (socket) => {

    console.log('[+] User connected', socket.id);
    
    // User disconnect
    socket.on('disconnect', () => {
      console.log('[-] User disconnected', socket.id);
      if (!users.has(socket.id))
        return;
      
      // Broadcast to all users in room about user disconnection
      const roomId = users.get(socket.id);
      io.to(roomId).emit('user-left', socket.id);

      // Remove user from users map
      users.delete(socket.id);

      // If only one user left in room, delete room
      if (rooms.get(roomId)?.totalUsers === 1) {
        console.log(`[!] Room ${roomId} deleted`);
        rooms.delete(roomId);
        return;
      }

      const newConnectedUsers = rooms.get(roomId)?.usersConnected.filter((user) => user.userId !== socket.id);
      const room = {
        ...rooms.get(roomId),
        usersConnected: newConnectedUsers,
        totalUsers: newConnectedUsers.length
      }

      console.log(room);
      rooms.set(roomId, room);
    });
    
    // Create room
    socket.on('create-room', () => {
      console.log(`Room created by ${socket.id}`);
      socket.join(socket.id);
      
      const user = getUserFromSocket(socket)

      const roomInfo = {
        roomOwnerId: socket.id,
        roomId: socket.id,
        usersConnected: [user],
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

      const room = rooms.get(roomId);
      socket.join(room.roomId);
      console.log(`[+] ${socket.id} joined room ${room.roomId}`);

      const user = getUserFromSocket(socket);

      const updatedRoom = {
        ...room,
        usersConnected: [...room.usersConnected, user],
        totalUsers: room.totalUsers + 1
      };
      rooms.set(roomId, updatedRoom);

      console.log(updatedRoom);

      users.set(socket.id, roomId);
      io.to(roomId).emit('user-joined', updatedRoom);
    });

    // Ping information from client
    socket.on('ping', (pingInformationFromClient) => {
      // Get room of socket
      const roomId = users.get(socket.id);

      // Get all previous clients in room with their pings
      const previousClients = pings.get(roomId) || new Map();
      
      // Add new client with their pings
      pings.set(roomId, new Map([...previousClients, [socket.id, pingInformationFromClient]]));
    });

    // Get best ping for clients
    socket.on('get-best-ping', () => {
      const roomId = users.get(socket.id);
      const clientPings = pings.get(roomId) || new Map();
      const bestAveragePing = getAverageBestPing(clientPings);


      // Convert Map to array of objects
      const bestAveragePingArray = Array.from(bestAveragePing, ([serverName, averagePing]) => ({ serverName, averagePing }));
      console.log(bestAveragePingArray);
      io.to(roomId).emit('best-ping', bestAveragePingArray);
    });

    socket.on('notify-ping', (roomId) => {
      io.to(roomId).emit('ping-started');
    });

    socket.on('update-ping', (roomId, userId) => {
      io.to(roomId).emit('ping-updated', userId);
    });
  });
}
