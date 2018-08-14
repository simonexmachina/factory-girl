/* eslint-disable no-unused-vars */
export default class DefaultAdapter {
  build(Model, props) {
    return new Model(props);
  }
  save(model, Model) {
    model.save();
    return model;
  }
  destroy(model, Model) {
    model.destroy();
    return model;
  }
  get(model, attr, Model) {
    return model.get(attr);
  }
  set(props, model, Model) {
    return model.set(props);
  }
}
