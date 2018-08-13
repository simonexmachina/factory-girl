import syncPopulate from './utils/syncPopulate';

export default class Factory {
  name = null;
  Model = null;
  initializer = null;
  options = {};

  constructor(Model, initializer, options = {}) {
    if (!Model) {
      throw new Error('Invalid Model constructor passed to the factory');
    }
    if (
      (typeof initializer !== 'object' && typeof initializer !== 'function') ||
      !initializer
    ) {
      throw new Error('Inalid initializer passed to the factory');
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
    return attrs;
  }

  attrs(extraAttrs = {}, buildOptions = {}) {
    const factoryAttrs = this.getFactoryAttrs(buildOptions);
    const modelAttrs = {};

    const filteredAttrs = Object.keys(factoryAttrs).reduce((attrs, name) => {
      if (!extraAttrs.hasOwnProperty(name)) attrs[name] = factoryAttrs[name];
      return attrs;
    }, {});

    syncPopulate(modelAttrs, filteredAttrs);
    syncPopulate(modelAttrs, extraAttrs);

    return modelAttrs;
  }

  build(adapter, extraAttrs = {}, buildOptions = {}) {
    const modelAttrs = this.attrs(extraAttrs, buildOptions);
    const model = adapter.build(this.Model, modelAttrs);
    return this.options.afterBuild
      ? this.options.afterBuild(model, extraAttrs, buildOptions)
      : model;
  }

  create(adapter, attrs = {}, buildOptions = {}) {
    const model = this.build(adapter, attrs, buildOptions);
    const savedModel = adapter.save(model, this.Model);
    return this.options.afterCreate
      ? this.options.afterCreate(savedModel, attrs, buildOptions)
      : savedModel;
  }

  attrsMany(num, attrsArray = [], buildOptionsArray = []) {
    let attrObject = null;
    let buildOptionsObject = null;

    if (typeof attrsArray === 'object' && !Array.isArray(attrsArray)) {
      attrObject = attrsArray;
      attrsArray = [];
    }
    if (
      typeof buildOptionsArray === 'object' &&
      !Array.isArray(buildOptionsArray)
    ) {
      buildOptionsObject = buildOptionsArray;
      buildOptionsArray = [];
    }
    if (typeof num !== 'number' || num < 1) {
      new Error('Invalid number of objects requested');
    }
    if (!Array.isArray(attrsArray)) {
      new Error('Invalid attrsArray passed');
    }
    if (!Array.isArray(buildOptionsArray)) {
      new Error('Invalid buildOptionsArray passed');
    }
    attrsArray.length = buildOptionsArray.length = num;
    const models = [];
    for (let i = 0; i < num; i++) {
      models[i] = this.attrs(
        attrObject || attrsArray[i] || {},
        buildOptionsObject || buildOptionsArray[i] || {}
      );
    }
    return models;
  }

  buildMany(
    adapter,
    num,
    attrsArray = [],
    buildOptionsArray = [],
    buildCallbacks = true
  ) {
    const attrs = this.attrsMany(num, attrsArray, buildOptionsArray);
    const builtModels = attrs.map(attr => adapter.build(this.Model, attr));
    return this.options.afterBuild && buildCallbacks
      ? builtModels.map(builtModel =>
          this.options.afterBuild(builtModel, attrsArray, buildOptionsArray)
        )
      : builtModels;
  }

  createMany(adapter, num, attrsArray = [], buildOptionsArray = []) {
    if (Array.isArray(num)) {
      buildOptionsArray = attrsArray;
      attrsArray = num;
      num = attrsArray.length;
    }
    const models = this.buildMany(adapter, num, attrsArray, buildOptionsArray);
    const createdModels = models.map(model => adapter.save(model, this.Model));
    return this.options.afterCreate
      ? createdModels.map(createdModel =>
          this.options.afterCreate(createdModel, attrsArray, buildOptionsArray)
        )
      : createdModels;
  }
}
