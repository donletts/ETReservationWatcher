Date.prototype.addDays = function(days) {
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

exports.getNextThreeDates = function () {
    let dates = []
    const today = new Date ();

    for (let i = 1; i < 4; i++) {
        let futureDay = today.addDays(i);
        let formattedDate = futureDay.getFullYear () + '-' + (
            futureDay.getMonth () + 1
        ) + '-' + futureDay.getDate ();
        dates.push ( formattedDate );
    }
    return dates;
}

exports.getDate = function () {
    const today = new Date ();
    const currentDay = today.getDay ();

    const options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    return today.toLocaleString ( "en-us", options );
}

exports.getDay = function () {
    const today = new Date ();
    const currentDay = today.getDay ();

    const options = {
        weekday: "long"
    };
    return today.toLocaleString ( "en-us", options );
}
