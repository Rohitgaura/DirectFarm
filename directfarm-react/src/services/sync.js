import localDB from './db';
import apiService from './api';
import socketService from './socket';

class SyncManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.syncInProgress = false;

        // Listen for network changes
        window.addEventListener('online', this.handleOnline);
        window.addEventListener('offline', this.handleOffline);
    }

    handleOnline = async () => {
        console.log('🌐 App is back online. Starting sync...');
        this.isOnline = true;
        await this.processSyncQueue();

        // Reconnect socket if needed
        const socket = socketService.getSocket();
        if (socket && !socket.connected) {
            socket.connect();
        }
    };

    handleOffline = () => {
        console.log('🔌 App is offline. Messages will be queued.');
        this.isOnline = false;
    };

    async processSyncQueue() {
        if (this.syncInProgress || !this.isOnline) return;

        this.syncInProgress = true;
        const queue = await localDB.getSyncQueue();

        console.log(`🔄 Processing ${queue.length} pending messages...`);

        for (const msg of queue) {
            try {
                // Try sending via API
                // Note: apiService.sendMessage needs to return the real message data from server
                console.log(`Attempting to send queued message: ${msg.tempId}`);

                const response = await apiService.sendMessage({
                    recipientId: msg.recipientId, // We stored this in temp message
                    productId: msg.productId,
                    message: msg.message
                });

                if (response.success) {
                    const realMessage = response.data;

                    // 1. Delete from Queue
                    await localDB.removeFromSyncQueue(msg.tempId);

                    // 2. Replace temp message in DB with real message
                    // We delete the temp message (by tempId) and add real one (by _id)
                    // Or if we used tempId as _id initially, we might need to update it
                    // My DB schema uses _id.

                    await localDB.deleteMessage(msg.tempId); // Delete optimistic
                    await localDB.saveMessage(realMessage); // Save confirmed

                    console.log(`✅ Message synced: ${msg.tempId} -> ${realMessage._id}`);

                    // Notify UI? We might need an event bus or just let live queries update
                } else {
                    console.error('Failed to sync message (logic error):', response.message);
                    // Decide: remove from queue or keep retrying?
                    // If 400 error (bad request), maybe remove. If 500/network, keep.
                }

            } catch (error) {
                console.error(`❌ Failed to sync message ${msg.tempId}:`, error);
                // Keep in queue for next retry
            }
        }

        this.syncInProgress = false;
    }

    // Call this when app initializes
    init() {
        if (this.isOnline) {
            this.processSyncQueue();
        }
    }
}

const syncManagerInstance = new SyncManager();
export default syncManagerInstance;
