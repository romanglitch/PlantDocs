module.exports = {
  afterCreate(event) {
    const { result, params } = event;

    const getDate = (addDays) => {
      let today = new Date(result.updatedAt);
      let getDate = addDays ? today.getDate() + addDays : today.getDate();
      let dd = String(getDate).padStart(2, '0');
      let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      let yyyy = today.getFullYear();

      today = yyyy + '-' + mm + '-' + dd;

      return today
    }

    // Add first week and first 7 days
    strapi.entityService.update('api::plant.plant', result.id, {
      data: {
        weeks: [
          {
            days: [
              {
                date: getDate()
              },
              {
                date: getDate(1)
              },
              {
                date: getDate(2)
              },
              {
                date: getDate(3)
              },
              {
                date: getDate(4)
              },
              {
                date: getDate(5)
              },
              {
                date: getDate(6)
              }
            ]
          }
        ],
      },
    });
  },
}
