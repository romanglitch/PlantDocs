module.exports = {
  afterCreate(event) {
    const { result, params } = event;

    // Add one day to current date
    const addOneDayToDate = (count) => {
      const date = new Date();

      count ? date.setDate(date.getDate() + count) : false

      return date
    }

    // Add 1 week and 7 days
    strapi.entityService.update('api::plant.plant', result.id, {
      data: {
        weeks: [
          {
            days: [
              {
                date: addOneDayToDate()
              },
              {
                date: addOneDayToDate(1)
              },
              {
                date: addOneDayToDate(2)
              },
              {
                date: addOneDayToDate(3)
              },
              {
                date: addOneDayToDate(4)
              },
              {
                date: addOneDayToDate(5)
              },
              {
                date: addOneDayToDate(6)
              }
            ]
          }
        ],
      },
    });
  },
}
