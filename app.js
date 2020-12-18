const express = require ( "express" );
const request = require ( "request" );
// const https = require("https");
const bodyParser = require ( "body-parser" );
const cheerio = require ( "cheerio" );
const got = require ( "got" );
const formData = require ( 'form-data' );
const mailSender = require ( __dirname + "/sendEmail.js" );

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
    form.append ( 'show_date', '2020-12-18' );

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
                const mailOptions = {
                    from: 'Don Letts 🧗‍♂️<don.letts@gmail.com>',
                    to: 'don.letts@gmail.com',
                    subject: 'hello from gmail',
                    text: 'hello from gmail'
                }
                const credentials = mailSender.getCredentials ( 'secrets/credentials.json', 'secrets/token.json' );
                const oAuth2Client = mailSender.setupAuth ( credentials );
                mailSender.sendMail ( mailOptions, credentials, oAuth2Client )
                    .then ( (result) => console.log ( 'Email sent ... ', result ) )
                    .catch ( (error) => console.log ( error.message ) )
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

setInterval ( checkForOpenSlots, 5000 );

app.listen ( process.env.PORT || port, function () {
    console.log ( "listening on port " + port );
} );