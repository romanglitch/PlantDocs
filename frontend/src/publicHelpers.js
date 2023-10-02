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

export const getPostfix = (number, one, two, five) => {
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) {
        return five;
    }
    n %= 10;
    if (n === 1) {
        return one;
    }
    if (n >= 2 && n <= 4) {
        return two;
    }
    return five;
};