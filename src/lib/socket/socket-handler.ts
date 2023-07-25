import ioClient from 'socket.io-client';

const PORT = 5919;

const socket = ioClient(`http://localhost:${PORT}`);

export default socket;
