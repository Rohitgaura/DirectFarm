import io from 'socket.io-client';

const getSocketUrl = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        // 1. Domain Access (directfarm.co.in or Cloudflare Tunnel)
        if (hostname.includes('directfarm.co.in') || (hostname !== 'localhost' && hostname !== '127.0.0.1' && !/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname))) {
            return process.env.REACT_APP_SOCKET_URL || window.location.origin;
        }

        // 2. Network IP Access (e.g. http://192.168.X.X:3000)
        if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
            return `http://${hostname}:5001`;
        }
    }

    // 3. Localhost Development
    return 'http://localhost:5001';
};

class SocketService {
    socket = null;

    connect() {
        if (!this.socket) {
            const socketUrl = getSocketUrl();
            this.socket = io(socketUrl, {
                path: '/socket.io',
                withCredentials: true,
                transports: ['polling', 'websocket'],
                reconnection: true,
                reconnectionAttempts: 15,
                reconnectionDelay: 2000,
                timeout: 20000
            });

            this.socket.on('connect', () => {
                console.log('⚡ Socket connected:', this.socket.id);
            });

            this.socket.on('connect_error', (err) => {
                console.warn('Socket connection retry:', err.message);
            });

            this.socket.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
            });
        }
        return this.socket;
    }

    join(userId) {
        if (this.socket && userId) {
            this.socket.emit('join', userId);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    getSocket() {
        return this.socket;
    }
}

const socketServiceInstance = new SocketService();
export default socketServiceInstance;
