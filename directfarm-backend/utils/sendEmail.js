const { google } = require('googleapis');

const sendEmail = async (options) => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET_KEY
    );

    oauth2Client.setCredentials({
        refresh_token: process.env.GMAIL_REFRESH_TOKEN
    });

    const gmail = google.gmail({
        version: 'v1',
        auth: oauth2Client
    });

    const email = [
        `From: ${process.env.GMAIL_USER}`,
        `To: ${options.email}`,
        `Subject: ${options.subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        '',
        options.message
    ].join('\r\n');

    const encodedMessage = Buffer
        .from(email)
        .toString('base64url');

    const result = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: encodedMessage
        }
    });

    console.log('✅ Email sent:', result.data.id);

    return result.data;
};

module.exports = sendEmail;