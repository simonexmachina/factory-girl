import DefaultAdapter from './DefaultAdapter';

/* eslint-disable no-unused-vars */
export default class ObjectionAdapter extends DefaultAdapter {

  build(Model, props) {
    const model = new Model();
    model.$set(props);
    return model;
  }

  save(doc, Model) {
    return Model.query().insert(doc);
  }

  destroy(model, Model) {
    return Model.query().deleteById(model.id);
  }

  get(model, attr, Model) {
    return model[attr];
  }

  set(props, model, Model) {
    return model.$set(props);
  }
}
