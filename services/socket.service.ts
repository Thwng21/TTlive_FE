import { io, Socket } from 'socket.io-client';

// Singleton instance
let socket: Socket | undefined;

const SOCKET_URL = 'http://localhost:3001';

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ['websocket'],
            upgrade: false,
            autoConnect: true,
            reconnection: true,
        });
        console.log('Socket instance created');
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = undefined;
    }
};
