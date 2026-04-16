import { io, Socket } from 'socket.io-client';

// In development with Vite, we proxy API requests. 
// For websocket, it's best to connect to the actual backend port or the origin directly.
// The Vite proxy usually proxies WS if configured, but let's point it to the current origin.
let socket: Socket;

export const getSocket = () => {
    if (!socket) {
        const SOCKET_URL = "https://dsaplanner.onrender.com";

        socket = io(SOCKET_URL, {
            autoConnect: false, // Don't connect until we have a token or user intent
            withCredentials: true
        });

        socket.on('connect', () => {
            console.log('Socket connected');
            // Wait, we need the userId. We can either decode the JWT or get it from a /users/me endpoint.
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });
    }
    return socket;
};

export const connectSocket = (userId: string) => {
    const s = getSocket();
    if (s.disconnected) {
        s.connect();
    }
    // ensure we authenticate
    s.emit('authenticate', userId);
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
    }
};
