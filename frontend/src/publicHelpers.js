const formatWeeksAndDays = (days) => {
    const weeks = Math.floor(days / 7);
    const daysLeft = days % 7;

    let result = [];

    if (weeks > 0) {
        // Правильно склоняем слово "неделя"
        if (weeks === 1) {
            result.push("1 неделя");
        } else if ([2, 3, 4].includes(weeks % 10) && ![12, 13, 14].includes(weeks % 100)) {
            result.push(`${weeks} недели`);
        } else {
            result.push(`${weeks} недель`);
        }
    }

    if (daysLeft > 0) {
        // Правильно склоняем слово "день"
        if (daysLeft === 1) {
            result.push("1 день");
        } else if ([2, 3, 4].includes(daysLeft)) {
            result.push(`${daysLeft} дня`);
        } else {
            result.push(`${daysLeft} дней`);
        }
    }

    if (result.length === 0) {
        return "0 дней";
    }

    return result.join(" и ");
}

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

        console.log(daysCount)
    }

    return daysCount;
};

export const countWeeks = (weeksArray) => {
    let daysCount = null

    if (weeksArray) {
        weeksArray.forEach(function (data) {
            let getPassedDays = data.days.filter((day) => day.passed === true)
            daysCount = daysCount + getPassedDays.length

        })
    }

    return formatWeeksAndDays(daysCount);
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