import Generator from './Generator';

export default class Assoc extends Generator {
  generate(name, key = null, attrs = {}, buildOptions = {}) {
    const model = this.factoryGirl.create(name, attrs, buildOptions);
    return key ? this.getAttribute(name, model, key) : model;
  }
}
