import { Server } from 'socket.io';

export default function socketHandler(server: any) {
  const io = new Server(server, {
    cors: {
      origin: 'http://127.0.0.1:5173'
    }
  });
  console.log("WebSocket server started");

  io.on('connection', (socket) => {
    console.log('User connected', socket.id);
    socket.on('disconnect', () => {
      console.log('User disconnected', socket.id);
    });
    
    socket.on('message', (message) => {
      console.log('Message received', message);
    });
    
  });
}
