export const formatDate = (date, addDays) => {
    let formatDate = new Date(date);

    let getDate = addDays ? formatDate.getDate() + addDays : formatDate.getDate();
    let dd = String(getDate).padStart(2, '0');
    let mm = String(formatDate.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = formatDate.getFullYear();

    formatDate = `${dd}/${mm}/${yyyy}`

    return formatDate
};

export const countDays = (weeksArray) => {
    let daysCount = null

    if (weeksArray) {
        weeksArray.forEach(function (data) {
            let getPassedDays = data.days.filter((day) => day.passed === true)
            daysCount = daysCount + getPassedDays.length
        })
    }

    return daysCount;
};