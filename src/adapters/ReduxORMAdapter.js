import DefaultAdapter from './DefaultAdapter';

/* eslint-disable no-unused-vars */
export default class ReduxORMAdapter extends DefaultAdapter {
  constructor(session) {
    super();
    this.session = session;
  }

  build(model, props) {
    return this.session[model.modelName].create(props);
  }

  get(model, attr) {
    return model[attr];
  }

  async save(model, Model) {
    return model;
  }

  async destroy(model, Model) {
    return Promise.resolve(model.delete()).then(() => true);
  }
}
