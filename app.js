const express = require ( "express" );
const request = require ( "request" );
// const https = require("https");
const bodyParser = require ( "body-parser" );
const cheerio = require ( "cheerio" );
const got = require ( "got" );
const formData = require ( 'form-data' );
const nodemailer = require ( 'nodemailer' );
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const date = require ( __dirname + "/sendEmail.js" );

const app = express ();
const port = 3000;

app.set ( 'view engine', 'ejs' );
app.use ( bodyParser.urlencoded ( {extended: true} ) );

var options = {
    'method': 'POST',
    'url': 'https://app.rockgympro.com/b/widget/?a=equery',
    'headers': {
        'Accept': '*/*',
        'DNT': '1',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36',
        'Content-Type': ['application/x-www-form-urlencoded; charset=UTF-8', 'application/x-www-form-urlencoded'],
        'Cookie': 'RGPSessionGUID=3866094825d0b3b49a03eaf4d85ce55c4462ee2199502fb8a3fd9678477d7b846a8ebf19b99a324d6821afb0d1563f91; BrowserSessionId=5fc54c9fd924b; RGPPortalSessionID=9m6rlpd0hplufem10esir286l1'
    },
    form: {
        'PreventChromeAutocomplete': '',
        'course_guid': '09111b41979d55cda993a87e569e08b2def30b84',
        'fctrl_1': 'offering_guid',
        'fctrl_2': 'course_guid',
        'fctrl_3': 'limited_to_course_guid_for_offering_guid_dbcd095c957c4e309dde5c28461036f7',
        'fctrl_4': 'show_date',
        'fctrl_5': 'pcount-pid-1-2486129',
        'fctrl_6': 'pcount-pid-1-6955401',
        'fctrl_7': 'pcount-pid-1-6955402',
        'ftagname_0_pcount-pid-1-2486129': 'pcount',
        'ftagname_0_pcount-pid-1-6955401': 'pcount',
        'ftagname_0_pcount-pid-1-6955402': 'pcount',
        'ftagname_1_pcount-pid-1-2486129': 'pid',
        'ftagname_1_pcount-pid-1-6955401': 'pid',
        'ftagname_1_pcount-pid-1-6955402': 'pid',
        'ftagval_0_pcount-pid-1-2486129': '1',
        'ftagval_0_pcount-pid-1-6955401': '1',
        'ftagval_0_pcount-pid-1-6955402': '1',
        'ftagval_1_pcount-pid-1-2486129': '2486129',
        'ftagval_1_pcount-pid-1-6955401': '6955401',
        'ftagval_1_pcount-pid-1-6955402': '6955402',
        'iframeid': '',
        'limited_to_course_guid_for_offering_guid_dbcd095c957c4e309dde5c28461036f7': '',
        'mode': 'p',
        'offering_guid': 'dbcd095c957c4e309dde5c28461036f7',
        'pcount-pid-1-2486129': '1',
        'pcount-pid-1-6955401': '0',
        'pcount-pid-1-6955402': '0',
        'random': '5fc54d4820129',
        'show_date': '2020-12-03'
    }
};

var reservationData = {date_label: "", event_list_html: ""}

// If modifying these scopes, delete token.json.
const SCOPES = [
    'https://mail.google.com/',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.send'
];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'secrets/token.json';


app.get ( "/", function (req, res) {
    // res.sendFile ( __dirname + "/index.html" );
    res.render ( "reservations", {reservationData: reservationData} );
} );


app.post ( "/", function (req, res) {
    var dateToWatch = req.body.dateToWatch.toString ();
    pingEarthTreks ( dateToWatch, res );
} );


function pingEarthTreks (dateToWatch, res) {
    options.form["show_date"] = dateToWatch;
    console.log ( dateToWatch );
    var date_label = ""
    var event_list_html = ""

    request ( options, function (error, response) {
        if (error) throw new Error ( error );
        const queryResponseData = JSON.parse ( response.body );
        reservationData.date_label = queryResponseData.date_label
        reservationData.event_list_html = queryResponseData.event_list_html
        res.redirect ( "/" );
    } );
}

const offering_guids = {
    golden: "dbcd095c957c4e309dde5c28461036f7",
    hamden: "503c88b01d36493790767d49703a01c0"
}

function checkForOpenSlots () {
    var today = new Date ();
    var date = today.getFullYear () + '-' + (
        today.getMonth () + 1
    ) + '-' + today.getDate ();
    var time = today.getHours () + ":" + today.getMinutes () + ":" + today.getSeconds ();
    var dateTime = date + ' ' + time;
    console.log ( "check For Open Slots: " + dateTime );

    const form = new formData ();
    form.append ( 'PreventChromeAutocomplete', '' );
    form.append ( 'course_guid', '09111b41979d55cda993a87e569e08b2def30b84' );
    form.append ( 'fctrl_1', 'offering_guid' );
    form.append ( 'fctrl_2', 'course_guid' );
    form.append ( 'fctrl_3', 'limited_to_course_guid_for_offering_guid_' + offering_guids["hamden"] );
    form.append ( 'fctrl_4', 'show_date' );
    form.append ( 'fctrl_5', 'pcount-pid-1-2486129' );
    form.append ( 'fctrl_6', 'pcount-pid-1-6955401' );
    form.append ( 'fctrl_7', 'pcount-pid-1-6955402' );
    form.append ( 'ftagname_0_pcount-pid-1-2486129', 'pcount' );
    form.append ( 'ftagname_0_pcount-pid-1-6955401', 'pcount' );
    form.append ( 'ftagname_0_pcount-pid-1-6955402', 'pcount' );
    form.append ( 'ftagname_1_pcount-pid-1-2486129', 'pid' );
    form.append ( 'ftagname_1_pcount-pid-1-6955401', 'pid' );
    form.append ( 'ftagname_1_pcount-pid-1-6955402', 'pid' );
    form.append ( 'ftagval_0_pcount-pid-1-2486129', '1' );
    form.append ( 'ftagval_0_pcount-pid-1-6955401', '1' );
    form.append ( 'ftagval_0_pcount-pid-1-6955402', '1' );
    form.append ( 'ftagval_1_pcount-pid-1-2486129', '2486129' );
    form.append ( 'ftagval_1_pcount-pid-1-6955401', '6955401' );
    form.append ( 'ftagval_1_pcount-pid-1-6955402', '6955402' );
    form.append ( 'iframeid', '' );
    form.append ( 'limited_to_course_guid_for_offering_guid_' + offering_guids["hamden"], '' );
    form.append ( 'mode', 'p' );
    form.append ( 'offering_guid', offering_guids["hamden"] );
    form.append ( 'pcount-pid-1-2486129', '1' );
    form.append ( 'pcount-pid-1-6955401', '0' );
    form.append ( 'pcount-pid-1-6955402', '0' );
    form.append ( 'random', '5fc54d4820129' );
    form.append ( 'show_date', '2020-12-14' );

    var header = {
        'Accept': '*/*',
        'DNT': '1',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36',
        'Content-Type': ['application/x-www-form-urlencoded; charset=UTF-8', 'application/x-www-form-urlencoded'],
        'Cookie': 'RGPSessionGUID=3866094825d0b3b49a03eaf4d85ce55c4462ee2199502fb8a3fd9678477d7b846a8ebf19b99a324d6821afb0d1563f91; BrowserSessionId=5fc54c9fd924b; RGPPortalSessionID=9m6rlpd0hplufem10esir286l1'
    };

    // form.submit({
    //     host: et_query_host,
    //     path: et_query_path,
    //     headers: header
    // }, function(err, res) {
    //     console.log(res.statusCode);
    // });
    const et_query_url = 'https://app.rockgympro.com/b/widget/?a=equery';

    let testData = {};
    (
        async () => {
            testData = await getData ( et_query_url, header, form );
            if (testData) {
                // mailtrap
                // let transport = nodemailer.createTransport ( {
                //     host: "smtp.mailtrap.io",
                //     port: 2525,
                //     auth: {
                //         user: "00846f5dc2cf4b",
                //         pass: "eaa41902429013"
                //     }
                // } );
                //now lets do it with gmail

                // const message = {
                //     from: 'elonmusk@tesla.com', // Sender address
                //     to: 'don.letts@gmail.com',         // List of recipients
                //     subject: 'Design Your Model S | Tesla', // Subject line
                //     text: 'Have the most fun you can in a car. Get your Tesla today!' // Plain text body
                // };
                // transport.sendMail(message, function(err, info) {
                //     if (err) {
                //         console.log(err)
                //     } else {
                //         console.log(info);
                //     }
                // });
                // Load client secrets from a local file.
                fs.readFile('secrets/credentials.json', (err, content) => {
                    if (err) return console.log('Error loading client secret file:', err);
                    // Authorize a client with credentials, then call the Gmail API.
                    authorize(JSON.parse(content), sendEmail);
                });
            }
        }
    ) ();
};

const noParens = (i, link) => {
    // Regular expression to determine if the text has parentheses.
    // const parensRegex = /^((?!\().)*$/;
    // return parensRegex.test(link.children[0].data);
    if (link.children
        && link.children.length > 1
        && link.children[1].children
        && link.children[1].children.length >= 1
        && link.children[1].children[0].data == "Availability") {
        return true;
    } else {
        return false;
    }
};

async function getData (et_query_url, header, form) {
    try {
        const response = await got.post ( et_query_url, {
            body: form,
            headers: header
        } ).json ();
        console.log ( response );
        const $ = cheerio.load ( response["event_list_html"] );
        const time_blocks = [];
        const availability = [];

        $ ( '#offering-page-select-events-table .offering-page-schedule-list-time-column' ).each ( function () {
            time_blocks.push ( $ ( this ).text ().trim () );
        } );
        $ ( 'td' ).filter ( noParens ).each ( (i, link) => {
            // console.log(i + " " + link);
            availability.push ( link.children[3].data.replace ( "spaces", "" ).trim () )
        } );
        return {time_blocks: time_blocks, availability: availability};
        // console.log ( $ ( 'table' ) );
    } catch (error) {
        console.log ( error.response.body );
        return {};
    }
}


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        tokens = JSON.parse(token)
        oAuth2Client.setCredentials(tokens);
        callback(oAuth2Client, tokens, credentials);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client, tokens, credentials);
        });
    });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
    const gmail = google.gmail({version: 'v1', auth});
    gmail.users.labels.list({
        userId: 'me',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const labels = res.data.labels;
        if (labels.length) {
            console.log('Labels:');
            labels.forEach((label) => {
                console.log(`- ${label.name}`);
            });
        } else {
            console.log('No labels found.');
        }
    });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function sendEmail (auth, tokens, credentials) {
    const {client_secret, client_id} = credentials.web;
    const {refresh_token} = tokens
    const accessToken = auth.getAccessToken();
    const transporter = nodemailer.createTransport ( {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            type: 'OAuth2',
            user: 'don.letts@gmail.com',
            clientId: client_id,
            clientSecret: client_secret,
            refreshToken: refresh_token,
            accessToken: accessToken,
        },
        tls: {
            rejectUnauthorized: false
        }
    } );
    const mailOptions = {
        from: 'don.letts@gmail.com',
        to: 'don.letts@gmail.com',
        subject: 'Message',
        text: 'I hope this message gets through!'
    };

    transporter.sendMail(mailOptions, (error, response) => {
        error ? console.log(error) : console.log(response);
        transporter.close();
    });
}


setInterval ( checkForOpenSlots, 5000 );

app.listen ( process.env.PORT || port, function () {
    console.log ( "listening on port " + port );
} );