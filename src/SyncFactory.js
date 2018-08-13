import asyncPopulate from './utils/asyncPopulate';

export default class Factory {
  name = null;
  Model = null;
  initializer = null;
  options = {};

  constructor(Model, initializer, options = {}) {
    if (!Model) {
      throw new Error('Invalid Model constructor passed to the factory');
    }
    if ((typeof initializer !== 'object' && typeof initializer !== 'function') ||
        !initializer) {
      throw new Error('Invalid initializer passed to the factory');
    }

    this.Model = Model;
    this.initializer = initializer;
    this.options = { ...this.options, ...options };
  }

  getFactoryAttrs(buildOptions = {}) {
    let attrs;
    if (typeof this.initializer === 'function') {
      attrs = this.initializer(buildOptions);
    } else {
      attrs = { ...this.initializer };
    }
    return Promise.resolve(attrs);
  }

  async attrs(extraAttrs = {}, buildOptions = {}) {
    const factoryAttrs = await this.getFactoryAttrs(buildOptions);
    const modelAttrs = {};

    const filteredAttrs = Object.keys(factoryAttrs).reduce((attrs, name) => {
      if (!extraAttrs.hasOwnProperty(name)) attrs[name] = factoryAttrs[name];
      return attrs;
    }, {});

    await asyncPopulate(modelAttrs, filteredAttrs);
    await asyncPopulate(modelAttrs, extraAttrs);

    return modelAttrs;
  }

  async build(adapter, extraAttrs = {}, buildOptions = {}) {
    const modelAttrs = await this.attrs(extraAttrs, buildOptions);
    const model = adapter.build(this.Model, modelAttrs);
    return this.options.afterBuild ?
        this.options.afterBuild(model, extraAttrs, buildOptions) :
        model;
  }

  async create(adapter, attrs = {}, buildOptions = {}) {
    const model = await this.build(adapter, attrs, buildOptions);
    return adapter.save(model, this.Model)
      .then(savedModel => (this.options.afterCreate ?
          this.options.afterCreate(savedModel, attrs, buildOptions) :
          savedModel
      ));
  }

  attrsMany(num, attrsArray = [], buildOptionsArray = []) {
    let attrObject = null;
    let buildOptionsObject = null;

    if (typeof attrsArray === 'object' && !Array.isArray(attrsArray)) {
      attrObject = attrsArray;
      attrsArray = [];
    }
    if (typeof buildOptionsArray === 'object' && !Array.isArray(buildOptionsArray)) {
      buildOptionsObject = buildOptionsArray;
      buildOptionsArray = [];
    }
    if (typeof num !== 'number' || num < 1) {
      return Promise.reject(new Error('Invalid number of objects requested'));
    }
    if (!Array.isArray(attrsArray)) {
      return Promise.reject(new Error('Invalid attrsArray passed'));
    }
    if (!Array.isArray(buildOptionsArray)) {
      return Promise.reject(new Error('Invalid buildOptionsArray passed'));
    }
    attrsArray.length = buildOptionsArray.length = num;
    const models = [];
    for (let i = 0; i < num; i++) {
      models[i] = this.attrs(
        attrObject || attrsArray[i] || {},
        buildOptionsObject || buildOptionsArray[i] || {}
      );
    }
    return Promise.all(models);
  }

  async buildMany(adapter, num, attrsArray = [], buildOptionsArray = [],
      buildCallbacks = true) {
    const attrs = await this.attrsMany(num, attrsArray, buildOptionsArray);
    const models = attrs.map(attr => adapter.build(this.Model, attr));
    return Promise.all(models)
      .then(builtModels => (this.options.afterBuild && buildCallbacks ?
          Promise.all(builtModels.map(builtModel => this.options.afterBuild(
            builtModel, attrsArray, buildOptionsArray
          ))) :
          builtModels
      ));
  }

  async createMany(adapter, num, attrsArray = [], buildOptionsArray = []) {
    if (Array.isArray(num)) {
      buildOptionsArray = attrsArray;
      attrsArray = num;
      num = attrsArray.length;
    }
    const models = await this.buildMany(
      adapter, num, attrsArray, buildOptionsArray
    );
    const savedModels = models.map(model => adapter.save(model, this.Model));
    return Promise.all(savedModels)
      .then(createdModels => (this.options.afterCreate ?
          Promise.all(createdModels.map(createdModel => this.options.afterCreate(
            createdModel, attrsArray, buildOptionsArray
          ))) :
          createdModels
      ));
  }
}
