module.exports = {
  beforeCreate(event) {
    const { data, where, select, populate } = event.params;
    // !TODO: При создании добавлять один блок недели и 7 дней
    // console.log(event.params)

    // Edit content
    // event.params.data.Content = 'Content edited'

  },

  afterCreate(event) {
    const { result, params } = event;

    // do something to the result;
  },
}
