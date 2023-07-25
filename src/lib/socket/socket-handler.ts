import ioClient from 'socket.io-client';

const PORT = process.env.PORT;

const socket = ioClient(`http://localhost:${PORT}`);

export default socket;
