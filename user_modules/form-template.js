

exports.get_options = function (gym_name){
// TODO expand guids to all local ET and EVO gyms
    const offering_guids = {
        golden: 'dbcd095c957c4e309dde5c28461036f7',
        hamden: '503c88b01d36493790767d49703a01c0'
    }

    if(!(gym_name in offering_guids)){
        console.log (gym_name + " either not a valid gym name or not available for selection")
        return {};
    }

// TODO prune down form data and options to what's absolutely necessary
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
            'fctrl_3': 'limited_to_course_guid_for_offering_guid_' + offering_guids[gym_name],
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
            ['limited_to_course_guid_for_offering_guid_' + offering_guids[gym_name]]: '',
            'mode': 'p',
            'offering_guid': offering_guids[gym_name],
            'pcount-pid-1-2486129': '1',
            'pcount-pid-1-6955401': '0',
            'pcount-pid-1-6955402': '0',
            'random': '5fc54d4820129'
        }
    };

    return {...options}; // return a copy of options
}

