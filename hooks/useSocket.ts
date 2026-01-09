'use client';

import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket } from '@/services/socket.service';

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const socketInstance = getSocket();
        
        if (!socketInstance.connected) {
            socketInstance.connect();
        }

        setSocket(socketInstance);

        // Do not disconnect on unmount to persist connection across page navigations (like locale switch)
        return () => {
            // socketInstance.disconnect(); 
        };
    }, []);

    return socket;
};
