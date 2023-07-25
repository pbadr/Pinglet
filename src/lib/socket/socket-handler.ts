import ioClient from 'socket.io-client';

import { env } from '$env/dynamic/public'

const PORT = 5919;

const socket = ioClient(`${env.PUBLIC_BASE_URL}:${PORT}`);

export default socket;
