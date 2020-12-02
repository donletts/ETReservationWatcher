const express = require ( "express" );
const request = require ( "request" );
// const https = require("https");
const bodyParser = require ( "body-parser" );

const app = express ();
const port = 3000;

app.use ( bodyParser.urlencoded ( {extended: true} ) );

app.get ( "/", function (req, res) {
    res.sendFile ( __dirname + "/index.html" );
} );

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

app.post ( "/", function (req, res) {
    var dateToWatch = req.body.dateToWatch.toString ();
    options.form["show_date"] = dateToWatch;
    console.log ( dateToWatch );

    request ( options, function (error, response) {
        if (error) throw new Error ( error );
        const queryResponseData = JSON.parse ( response.body );
        res.write ( queryResponseData.date_label );
        res.write ( queryResponseData.event_list_html );
        res.send ();
    } );
} );

app.listen ( process.env.PORT || port, function () {
    console.log ( "listening on port " + port );
} );