// load the .env file into the environment (process.env)
// TODO remove this comment when we're sure we know what we're doing
// this is going to be passed in via command line now. see readme.md
// require('dotenv').config();
// web stuff
const express = require ( "express" );
const request = require ( "request" );
const bodyParser = require ( "body-parser" );
const cheerio = require ( "cheerio" );
const got = require ( "got" );
const formData = require ( 'form-data' );
const ejs = require ( 'ejs' );
const path = require ( 'path' );
// local imports
const mailSender = require ( __dirname + "/user_modules/sendEmail.js" );
const dateHelper = require ( __dirname + "/user_modules/date.js" );
const formTemplate = require ( __dirname + '/user_modules/form-template.js' )
// mongo stuff
const mongo_connections = require ( __dirname + '/user_modules/mongoConnections.js' );
const get_emails_for_gym_name = mongo_connections.get_emails_for_gym_name;
const get_all_gyms = mongo_connections.get_all_gyms;

(async() => {
    const testdb = await get_emails_for_gym_name("golden");
    const all_gyms = await get_all_gyms();

    for(let i = 0; i < all_gyms.length; i++){
        let brands = all_gyms[i].brands;
        for(let j = 0; j < brands.length; j++){
            let names = brands[j].names;
            for(let k = 0; k < names.length; k++){
                console.log (`${all_gyms[i].region} ${brands[j].brand} ${names[k].name}`);
            }
        }
    }

    console.log ("testing");
})()


const app = express ();
const port = 3000;

app.set ( 'view engine', 'ejs' );
app.use ( bodyParser.urlencoded ( {extended: true} ) );
app.use ( express.static ( path.join(__dirname,"public") ) );

var reservationData = {date_label: "", event_list_html: ""}

app.get ( "/", function (req, res) {
    get_all_gyms().then((all_gyms) => {
        res.render ( "reservations", {all_gyms: all_gyms, reservationData: reservationData} );
    });
} );


app.post ( "/", function (req, res) {
    let dateToWatch = req.body.dateToWatch.toString ();
    let gym_name = req.body.gym_name;
    pingEarthTreks ( dateToWatch, gym_name, res );
} );


function pingEarthTreks (dateToWatch, gym_name, res) {
    const options = formTemplate.get_options ( gym_name )
    options.form["show_date"] = dateToWatch;
    console.log ( gym_name );
    console.log ( dateToWatch );

    request ( options, function (error, response) {
        if (error) throw new Error ( error );
        const queryResponseData = JSON.parse ( response.body );
        reservationData.date_label = queryResponseData.date_label
        reservationData.event_list_html = queryResponseData.event_list_html
        res.redirect ( "/" );
    } );
}

// TODO pass in gym name
// TODO pass in list of people to email

function checkForOpenSlots (gym_name) {

    const et_query_url = 'https://app.rockgympro.com/b/widget/?a=equery';

    (
        async _ => {
            let testData = await getData ( et_query_url, gym_name );

            if (Object.entries ( testData ).length > 0) {

                filePath = __dirname + '/views/availability.ejs';
                availabilityString = await ejs.renderFile ( filePath, {availability: testData} );

                const emails = await get_emails_for_gym_name ( gym_name );

                if (emails) {
                    const mailOptions = {
                        from: 'Don Letts 🧗‍♂️<don.letts@gmail.com>',
                        to: 'don.letts@gmail.com', //, lisa.haisfield@gmail.com',
                        subject: 'Current 3 Day ET Availability',
                        text: availabilityString
                    }
                    // refresh token generated 11:52am 2020-12-23
                    // pretty sure this needs to get refreshed every 10 days
                    // TODO look into programmatically updating refresh token if expired
                    // probably not possible because you need to manually consent

                    // Prefer environment variables over json config files
                    // TODO probably remove the ability to use config files at some point

                    const credentials = mailSender.getEnvCredentials ()
                        || mailSender.getCredentials ( 'secrets/credentials.json', 'secrets/token.json' );
                    const oAuth2Client = mailSender.setupAuth ( credentials );
                    mailSender.sendMail ( mailOptions, credentials, oAuth2Client )
                        .then ( (result) => console.log ( 'Email sent ... ', result ) )
                        .catch ( (error) => console.log ( error.message ) );
                }
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
        if (isAvailabilityTable ( i, link )
            && hasSpace ( i, link )
            && isNotFull ( i, link )
        ) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        console.log ( e );
    }
}

const isNotFull = (i, link) => {
    try {
        if (!(
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
};

const hasSpace = (i, link) => {
    try {
        if (link.children.length > 3
            && link.children[3].data
            && (
                link.children[3].data.includes ( "spaces" )
                || link.children[3].data.includes ( "space" )
            )
        ) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        console.log ( e );
    }
};

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

function parse_response (response, time_blocks, date, totalAvailability) {
    const $ = cheerio.load ( response["event_list_html"] );

    $ ( '#offering-page-select-events-table .offering-page-schedule-list-time-column' ).each ( function () {
        if (!time_blocks[date]) {
            time_blocks[date] = [];
        }
        time_blocks[date].push ( $ ( this ).text ().trim () );
    } );
    $ ( 'td' ).filter ( isAvailabilityTable ).each ( (i, link) => {
        if (isAvailable ( i, link )) {
            if (!totalAvailability[date]) {
                totalAvailability[date] = {};
            }
            totalAvailability[date][time_blocks[date][i]] = link.children[3].data.replace ( "spaces", "" ).replace ( "space", "" ).trim ()
        }
    } )
    $ ( '.offering-page-call-for-booking' ).each ( (i, link) => {
        if (isNotAvailabileYet ( i, link )) {
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

function clean_garbage_entries (totalAvailability) {
    if (Object.entries ( totalAvailability ).length > 0) {
        for (let element in totalAvailability) {
            if (Object.entries ( totalAvailability[element] ).length == 0) {
                delete totalAvailability[element];
            }
        }
    }
}

function populate_form_data (formInfo, date) {
    formInfo['show_date'] = date;

    const form = new formData ();
    for (let key in formInfo) {
        form.append ( key, formInfo[key] )
    }
    return form;
}

async function query_gym (et_query_url, headers, form) {
    const response = await got.post ( et_query_url, {
        body: form,
        headers: headers
    } ).json ();
    return response;
}

async function getData (et_query_url, gym_name) {
    try {
        const time_blocks = {};
        const totalAvailability = {};
        const dates = dateHelper.getNextThreeDates ();
        for (let date of dates) {
            const options = formTemplate.get_options ( gym_name );
            let form = populate_form_data ( options.form, date );
            const response = await query_gym ( et_query_url, options["headers"], form );
            parse_response ( response, time_blocks, date, totalAvailability );
        }
        //clean out garbage entries
        clean_garbage_entries ( totalAvailability );

        return totalAvailability;
    } catch (error) {
        console.log ( error );
        return {};
    }
}

// TODO add to database and monitor open intervals
// TODO be able to have user add/remove intervals
// checkForOpenSlots every 10 minutes (10 * 60 * 1000 = 600000 milliseconds)
let test = setInterval ( checkForOpenSlots, 600000, "hamden" );
// let test = setInterval ( checkForOpenSlots, 600000, param1, param2 );
// clearInterval(test);

app.listen ( process.env.PORT || port, function () {
    console.log ( "listening on port " + port );
} );