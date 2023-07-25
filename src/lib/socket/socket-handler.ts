import ioClient from 'socket.io-client';

import { env } from '$env/dynamic/public'

const socket = ioClient(`${env.PUBLIC_BASE_URL}`);

export default socket;
