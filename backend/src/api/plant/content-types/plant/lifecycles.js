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
        Name: result.Name + '(1 week / 7 days added)',
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
        ]
      },
    });

    // Write history on create plant
    strapi.entityService.create('api::history.history', {
      data: {
        action:'create',
        content:result,
        params:params,
        request:event,
        plant: result.id,
        plant_published: false,
      },
    });
  },
  afterUpdate(event) {
    const { result, params } = event;

    // Write history on update plant

    strapi.entityService.create('api::history.history', {
      data: {
        action:'update',
        content:result,
        params:params,
        request:event,
        plant: result.id,
        plant_published: !!result.publishedAt,
      },
    });
  }
}
