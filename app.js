const express = require ( "express" );
const request = require ( "request" );
const bodyParser = require ( "body-parser" );
const cheerio = require ( "cheerio" );
const got = require ( "got" );
const formData = require ( 'form-data' );
const ejs = require ( 'ejs' );
const mailSender = require ( __dirname + "/sendEmail.js" );
const dateHelper = require ( __dirname + "/date.js" );

const app = express ();
const port = 3000;

app.set ( 'view engine', 'ejs' );
app.use ( bodyParser.urlencoded ( {extended: true} ) );

const offering_guids = {
    golden: 'dbcd095c957c4e309dde5c28461036f7',
    hamden: '503c88b01d36493790767d49703a01c0'
}

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
        'course_guid': '503c88b01d36493790767d49703a01c0',
        'fctrl_1': 'offering_guid',
        'fctrl_2': 'course_guid',
        'fctrl_3': 'limited_to_course_guid_for_offering_guid_' + offering_guids['golden'],
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
        ['limited_to_course_guid_for_offering_guid_' + offering_guids['golden']]: '',
        'mode': 'p',
        'offering_guid': offering_guids['golden'],
        'pcount-pid-1-2486129': '1',
        'pcount-pid-1-6955401': '0',
        'pcount-pid-1-6955402': '0',
        'random': '5fc54d4820129'
    }
};

var reservationData = {date_label: "", event_list_html: ""}

app.get ( "/", function (req, res) {
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

function checkForOpenSlots () {

    const et_query_url = 'https://app.rockgympro.com/b/widget/?a=equery';

    (
        async _ => {
            let testData = await getData ( et_query_url );

            if (Object.entries ( testData ).length > 0) {

                filePath = __dirname + '/views/availability.ejs';
                availabilityString = await ejs.renderFile ( filePath, {availability: testData} );

                const mailOptions = {
                    from: 'Don Letts 🧗‍♂️<don.letts@gmail.com>',
                    to: 'don.letts@gmail.com, lisa.haisfield@gmail.com',
                    subject: 'Current 3 Day ET Availability',
                    text: availabilityString
                }
                // refresh token generated 11:52am 2020-12-23
                const credentials = mailSender.getCredentials ( 'secrets/credentials.json', 'secrets/token.json' );
                const oAuth2Client = mailSender.setupAuth ( credentials );
                mailSender.sendMail ( mailOptions, credentials, oAuth2Client )
                    .then ( (result) => console.log ( 'Email sent ... ', result ) )
                    .catch ( (error) => console.log ( error.message ) )
            }
        }
    ) ();
};

const isNotAvailabileYet = (i, link) => {
    try {
        if (link.children
            && link.children.length > 0
            && link.children[0].data
            && link.children[0].data.includes ( "NOT" )) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        console.log ( e );
    }
}

const isAvailable = (i, link) => {
    try {
        if (link.children
            && link.children.length > 1
            && link.children[1].children
            && link.children[1].children.length > 0
            && link.children[1].children[0].data
            && link.children[1].children[0].data == "Availability"
            && link.children.length > 3
            && link.children[3].data
            && (
                link.children[3].data.includes ( "spaces" )
                || link.children[3].data.includes ( "space" )
            )
            && !(
                link.children[3].children
                && link.children[3].children.length > 0
                && link.children[3].children[0].data
                && link.children[3].children[0].data.includes ( "Full" )
            )
        ) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        console.log ( e );
    }
}
const isAvailabilityTable = (i, link) => {
    try {
        if (link.children
            && link.children.length > 1
            && link.children[1].children
            && link.children[1].children.length > 0
            && link.children[1].children[0].data
            && link.children[1].children[0].data == "Availability"
        ) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        console.log ( e );
    }
};

async function getData (et_query_url) {
    try {
        const time_blocks = {};
        const totalAvailability = {};
        const dates = dateHelper.getNextThreeDates ();
        for (let date of dates) {
            let formInfo = {...options.form};
            formInfo['show_date'] = date;

            const form = new formData ();
            for (let key in formInfo) {
                form.append ( key, formInfo[key] )
            }

            const response = await got.post ( et_query_url, {
                body: form,
                headers: options['headers']
            } ).json ();
            const $ = cheerio.load ( response["event_list_html"] );

            $ ( '#offering-page-select-events-table .offering-page-schedule-list-time-column' ).each ( function () {
                if (!time_blocks[date]) {
                    time_blocks[date] = [];
                }
                time_blocks[date].push ( $ ( this ).text ().trim () );
            } );
            $ ( 'td' ).filter(isAvailabilityTable).each ( (i, link) => {
                if(isAvailable(i, link)){
                    if (!totalAvailability[date]) {
                        totalAvailability[date] = {};
                    }
                    totalAvailability[date][time_blocks[date][i]] = link.children[3].data.replace ( "spaces", "" ).replace("space", "").trim ()
                }
            } )
            $ ( '.offering-page-call-for-booking' ).each ( (i, link) => {
                if(isNotAvailabileYet(i, link)){
                    if (totalAvailability[date]
                        && time_blocks[date]
                        && time_blocks[date][i]
                        && totalAvailability[date][time_blocks[date][i]]
                    ) {
                        delete totalAvailability[date][time_blocks[date][i]];
                    }
                }
            } )
        }

        //clean out garbage entries
        if (Object.entries ( totalAvailability ).length > 0) {
            for (let element in totalAvailability) {
                if (Object.entries ( totalAvailability[element] ).length == 0) {
                    delete totalAvailability[element];
                }
            }
        }

        return totalAvailability;
    } catch (error) {
        console.log ( error.response.body );
        return {};
    }
}

// checkForOpenSlots every 10 minutes (10 * 60 * 1000 = 600000 milliseconds)
setInterval ( checkForOpenSlots, 600000 );

app.listen ( process.env.PORT || port, function () {
    console.log ( "listening on port " + port );
} );