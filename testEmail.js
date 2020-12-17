const nodemailer = require ( 'nodemailer' )
const {google} = require ( 'googleapis' )
const fs = require ( 'fs' );


function getCredentials (credential_file, token_file) {
    const content1 = fs.readFileSync ( credential_file )
    const credentials = JSON.parse ( content1 );
    const {client_secret, client_id, redirect_uris} = credentials.web;
    const content2 = fs.readFileSync ( token_file )
    const tokens = JSON.parse ( content2 );
    const {refresh_token} = tokens;
    return {refresh_token, client_secret, client_id, redirect_uris};
}

function setupAuth (credentials) {
    const {
        refresh_token, client_secret, client_id, redirect_uris
    } = credentials;
    const oAuth2Client = new google.auth.OAuth2 (
        client_id,
        client_secret,
        redirect_uris
    );
    oAuth2Client.setCredentials ( {refresh_token: refresh_token} )
    return oAuth2Client;
}

async function sendMail (mailOptions, credentials, oAuth2Client) {
    const {
        refresh_token, client_secret, client_id
    } = credentials;
    try {
        const accessToken = await oAuth2Client.getAccessToken ()
        const transport = nodemailer.createTransport ( {
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'don.letts@gmail.com',
                clientId: client_id,
                clientSecret: client_secret,
                refreshToken: refresh_token,
                accessToken: accessToken
            }
        } )
        const result = await transport.sendMail ( mailOptions )
        return result
    } catch (error) {
        return error
    }
}

const mailOptions = {
    from: 'Don Letts 🧗‍♂️<don.letts@gmail.com>',
    to: 'don.letts@gmail.com',
    subject: 'hello from gmail',
    text: 'hello from gmail'
}
const credentials = getCredentials ( 'secrets/credentials.json', 'secrets/token.json' );
const oAuth2Client = setupAuth(credentials);
sendMail ( mailOptions, credentials, oAuth2Client)
    .then ( (result) => console.log ( 'Email sent ... ', result ) )
    .catch ( (error) => console.log ( error.message ) )
