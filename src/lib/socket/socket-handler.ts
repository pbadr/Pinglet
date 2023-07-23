import ioClient from 'socket.io-client';

const socket = ioClient('http://localhost:5173');

export default socket;
