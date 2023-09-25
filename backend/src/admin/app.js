import favicon from './extensions/favicon-32x32.png';

export default {
  config: {
    locales: ['ru'],
    head: {
      favicon: favicon,
    },
    translations: {
      ru: { // Возможно имеет смысл изменить экземпляр Strapi, дабы при переключении на англ. язык везде был PlantDocs и.т.д
        "app.components.HomePage.welcome.again": "Панель управления PlantDocs",
        "app.components.LeftMenu.navbrand.title": "PlantDocs",
        "app.components.LeftMenu.plugins": "Модули"
      },
    },
    tutorials: false,
    // При изменении экземпляра имеет смысл отключить обновления
    // notifications: {
    //   releases: false
    // },
  },
  bootstrap() {},
};
