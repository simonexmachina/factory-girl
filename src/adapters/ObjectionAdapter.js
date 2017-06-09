import DefaultAdapter from './DefaultAdapter';

/* eslint-disable no-unused-vars */
export default class ObjectionAdapter extends DefaultAdapter {
  save(doc, Model) {
    return Model.query().insert(doc);
  }

  destroy(model, Model) {
    return Model.query().deleteById(model.id);
  }
}
