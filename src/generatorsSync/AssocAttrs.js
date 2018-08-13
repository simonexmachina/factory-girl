import Generator from './Generator';

export default class AssocAttrs extends Generator {
  generate(name, key = null, attrs = {}, buildOptions = {}) {
    const model = this.factoryGirl.attrs(name, attrs, buildOptions);
    return key ? this.getAttribute(name, model, key) : model;
  }
}
