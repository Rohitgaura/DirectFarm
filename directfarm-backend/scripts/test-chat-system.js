const API_URL = 'http://localhost:5001/api';

async function post(url, data, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(API_URL + url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
    });
    return res.json();
}

async function get(url, token) {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(API_URL + url, {
        method: 'GET',
        headers
    });
    return res.json();
}

async function testChatSystem() {
    try {
        console.log('🚀 Starting Chat System Test...');

        // 1. Register User 1
        const user1Data = {
            name: 'TestUserOne',
            email: `testuser1_${Date.now()}@example.com`,
            password: 'password123',
            phone: '1234567890',
            role: 'farmer',
            experienceYears: 5
        };
        console.log(`\n👤 Registering User 1: ${user1Data.email}`);
        const reg1 = await post('/auth/register', user1Data);
        if (!reg1.success) throw new Error('Reg1 Failed: ' + JSON.stringify(reg1));
        const token1 = reg1.data.token;
        const userId1 = reg1.data.user._id;
        console.log('✅ User 1 Registered. ID:', userId1);

        // 2. Register User 2
        const user2Data = {
            name: 'TestUserTwo',
            email: `testuser2_${Date.now()}@example.com`,
            password: 'password123',
            phone: '0987654321',
            role: 'buyer'
        };
        console.log(`\n👤 Registering User 2: ${user2Data.email}`);
        const reg2 = await post('/auth/register', user2Data);
        if (!reg2.success) throw new Error('Reg2 Failed: ' + JSON.stringify(reg2));
        const token2 = reg2.data.token;
        const userId2 = reg2.data.user._id;
        console.log('✅ User 2 Registered. ID:', userId2);

        // 3. User 1 creates room with User 2
        console.log('\n🏠 User 1 creating chat room with User 2...');
        const roomRes = await post('/chat/room', { targetUserId: userId2 }, token1);
        if (!roomRes.success) throw new Error('Create Room Failed: ' + JSON.stringify(roomRes));
        const roomId = roomRes.roomId;
        console.log('✅ Room Created/Found. Room ID:', roomId);

        // 4. User 1 sends message
        const messageText = 'Hello from User 1!';
        console.log(`\n📨 User 1 sending message: "${messageText}"`);
        const msgRes = await post('/chat/message', { roomId, text: messageText }, token1);
        if (!msgRes.success) throw new Error('Send Message Failed: ' + JSON.stringify(msgRes));
        console.log('✅ Message Sent. Message ID:', msgRes.data._id);

        // 5. User 2 fetches messages
        console.log('\n📥 User 2 fetching messages...');
        const historyRes = await get(`/chat/messages/${roomId}`, token2);
        if (!historyRes.success) throw new Error('Fetch Messages Failed: ' + JSON.stringify(historyRes));

        const messages = historyRes.data;
        console.log(`✅ User 2 fetched ${messages.length} messages.`);

        if (messages.length > 0 && messages[0].text === messageText) {
            console.log('✅ VERIFICATION SUCCESS: Message text matches.');
        } else {
            console.error('❌ VERIFICATION FAILED: Message text mismatch or empty.');
            console.log('Received First Message:', messages[0]);
        }

        // 6. User 2 fetches rooms list
        console.log('\n📋 User 2 fetching chat rooms list...');
        const roomsListRes = await get(`/chat/rooms/${userId2}`, token2);
        if (!roomsListRes.success) throw new Error('Fetch Rooms Failed: ' + JSON.stringify(roomsListRes));
        const rooms = roomsListRes.data;
        console.log(`✅ User 2 has ${rooms.length} chat rooms.`);
        if (rooms.find(r => r._id === roomId)) {
            console.log('✅ VERIFICATION SUCCESS: Room found in list.');
        } else {
            console.error('❌ VERIFICATION FAILED: Room not found in list.');
        }

    } catch (error) {
        console.error('❌ Test Failed:', error);
    }
}

testChatSystem();
