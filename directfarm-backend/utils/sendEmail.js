const { google } = require('googleapis');

const sendEmail = async (options) => {
    const clientId = process.env.GMAIL_CLIENT_ID?.trim();
    const clientSecret = process.env.GMAIL_CLIENT_SECRET_KEY?.trim();
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN?.trim();
    const senderEmail = process.env.GMAIL_USER?.trim();

    const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret
    );

    oauth2Client.setCredentials({
        refresh_token: refreshToken
    });

    const gmail = google.gmail({
        version: 'v1',
        auth: oauth2Client
    });

    const email = [
        `From: ${senderEmail}`,
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