export default class DummyObjectionModel {

  static query() {

    return {

      insert(model) {
        return Promise.resolve(model);
      },

      deleteById() {
        return Promise.resolve(1);
      },

    };
  }

  $set(props) {
    Object.assign(this, props);
  }

}
