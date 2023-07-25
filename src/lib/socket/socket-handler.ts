import ioClient from 'socket.io-client';

const PORT = 5919;

const socket = ioClient(`http://0.0.0.0:${PORT}`);

export default socket;
