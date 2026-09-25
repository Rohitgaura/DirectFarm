import { openDB } from 'idb';

const DB_NAME = 'DirectFarmChat';
const DB_VERSION = 1;

class LocalDB {
    constructor() {
        this.dbPromise = this.initDB();
    }

    async initDB() {
        return openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                // Messages Store
                if (!db.objectStoreNames.contains('messages')) {
                    const messageStore = db.createObjectStore('messages', { keyPath: '_id' });
                    messageStore.createIndex('roomId', 'roomId', { unique: false });
                    messageStore.createIndex('createdAt', 'createdAt', { unique: false });
                    messageStore.createIndex('status', 'status', { unique: false });
                }

                // Conversations Store (for list view)
                if (!db.objectStoreNames.contains('conversations')) {
                    db.createObjectStore('conversations', { keyPath: 'roomId' });
                }

                // Sync Queue (for offline messages)
                if (!db.objectStoreNames.contains('syncQueue')) {
                    db.createObjectStore('syncQueue', { keyPath: 'tempId' });
                }
            },
        });
    }

    // --- Messages ---

    async saveMessage(message) {
        const db = await this.dbPromise;
        // Ensure _id exists, if not use tempId or create one if completely missing (shouldn't happen for sent msgs)
        if (!message._id && message.tempId) {
            message._id = message.tempId;
        }
        await db.put('messages', message);
        await this.updateConversation(message); // Update last message in conversation
    }

    async getMessages(roomId) {
        const db = await this.dbPromise;
        // Get all messages where roomId matches
        const allMessages = await db.getAllFromIndex('messages', 'roomId', roomId);
        // idb index retrieval might not be sorted by createdAt by default if index isn't used for sorting explicitly
        // But let's sort manually to be safe
        return allMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    async getMessage(id) {
        const db = await this.dbPromise;
        return db.get('messages', id);
    }

    async deleteMessage(id) {
        const db = await this.dbPromise;
        return db.delete('messages', id);
    }

    // --- Conversations ---

    async updateConversation(message) {
        const db = await this.dbPromise;
        const conversation = await db.get('conversations', message.roomId);

        const updatedConversation = {
            roomId: message.roomId,
            lastMessage: message.message,
            lastTime: message.createdAt,
            // We might need partner details here too, but for now just basic info
            // Ideally we fetch partner info from API and store it too
            ...conversation
        };

        await db.put('conversations', updatedConversation);
    }

    async getConversations() {
        const db = await this.dbPromise;
        return db.getAll('conversations');
    }


    // --- Sync Queue ---

    async addToSyncQueue(message) {
        const db = await this.dbPromise;
        await db.put('syncQueue', message);
    }

    async getSyncQueue() {
        const db = await this.dbPromise;
        return db.getAll('syncQueue');
    }

    async removeFromSyncQueue(tempId) {
        const db = await this.dbPromise;
        await db.delete('syncQueue', tempId);
    }

    async clear() {
        const db = await this.dbPromise;
        await db.clear('messages');
        await db.clear('conversations');
        await db.clear('syncQueue');
    }
}

const localDBInstance = new LocalDB();
export default localDBInstance;
