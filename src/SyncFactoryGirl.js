import Factory from './SyncFactory';
import Sequence from './generatorsSync/Sequence';
import Assoc from './generatorsSync/Assoc';
import AssocAttrs from './generatorsSync/AssocAttrs';
import AssocMany from './generatorsSync/AssocMany';
import AssocAttrsMany from './generatorsSync/AssocAttrsMany';
import ChanceGenerator from './generatorsSync/ChanceGenerator';
import OneOf from './generatorsSync/OneOf';
import DefaultAdapter from './adapters/DefaultSyncAdapter';

export default class SyncFactoryGirl {
  factories = {};
  options = {};
  adapters = {};
  created = new Set();

  constructor(options = {}) {
    this.assoc = generatorThunk(this, Assoc);
    this.assocMany = generatorThunk(this, AssocMany);
    this.assocBuild = deprecate('assocBuild', 'assocAttrs');
    this.assocBuildMany = deprecate('assocBuildMany', 'assocAttrsMany');
    this.assocAttrs = generatorThunk(this, AssocAttrs);
    this.assocAttrsMany = generatorThunk(this, AssocAttrsMany);
    this.seq = this.sequence = (...args) =>
      generatorThunk(this, Sequence)(...args);
    this.resetSeq = this.resetSequence = id => {
      Sequence.reset(id);
    };
    this.chance = generatorThunk(this, ChanceGenerator);
    this.oneOf = generatorThunk(this, OneOf);

    this.defaultAdapter = new DefaultAdapter();
    this.options = options;
  }

  define(name, Model, initializer, options = {}) {
    if (this.getFactory(name, false)) {
      throw new Error(`Factory ${name} already defined`);
    }
    const factory = (this.factories[name] = new Factory(
      Model,
      initializer,
      options
    ));
    return factory;
  }

  extend(parent, name, childInitializer, options = {}) {
    if (this.getFactory(name, false)) {
      throw new Error(`Factory ${name} already defined`);
    }
    const parentFactory = this.getFactory(parent, true);
    const Model = options.model || parentFactory.Model;
    let jointInitializer;

    function resolveInitializer(initializer, buildOptions) {
      return typeof initializer === 'function'
        ? initializer(buildOptions)
        : initializer;
    }

    if (
      typeof parentFactory.initializer === 'function' ||
      typeof childInitializer === 'function'
    ) {
      jointInitializer = function initializer(buildOptions = {}) {
        return Object.assign(
          {},
          resolveInitializer(parentFactory.initializer, buildOptions),
          resolveInitializer(childInitializer, buildOptions)
        );
      };
    } else {
      jointInitializer = Object.assign(
        {},
        parentFactory.initializer,
        childInitializer
      );
    }

    const factory = (this.factories[name] = new Factory(
      Model,
      jointInitializer,
      options
    ));
    return factory;
  }

  attrs(name, attrs, buildOptions = {}) {
    return this.getFactory(name).attrs(attrs, buildOptions);
  }

  build(name, attrs = {}, buildOptions = {}) {
    const adapter = this.getAdapter(name);
    const model = this.getFactory(name).build(adapter, attrs, buildOptions);
    return this.options.afterBuild
      ? this.options.afterBuild(model, attrs, buildOptions)
      : model;
  }

  create(name, attrs, buildOptions = {}) {
    const adapter = this.getAdapter(name);
    const createdModel = this.getFactory(name).create(
      adapter,
      attrs,
      buildOptions
    );
    const model = this.addToCreatedList(adapter, createdModel);
    return this.options.afterCreate
      ? this.options.afterCreate(model, attrs, buildOptions)
      : model;
  }

  attrsMany(name, num, attrs, buildOptions = {}) {
    return this.getFactory(name).attrsMany(num, attrs, buildOptions);
  }

  buildMany(name, num, attrs, buildOptions = {}) {
    const adapter = this.getAdapter(name);
    const models = this.getFactory(name).buildMany(
      adapter,
      num,
      attrs,
      buildOptions
    );
    return this.options.afterBuild
      ? models.map(model => this.options.afterBuild(model, attrs, buildOptions))
      : models;
  }

  createMany(name, num, attrs, buildOptions = {}) {
    const adapter = this.getAdapter(name);
    const createdModels = this.getFactory(name).createMany(
      adapter,
      num,
      attrs,
      buildOptions
    );
    const models = this.addToCreatedList(adapter, createdModels);
    return this.options.afterCreate
      ? models.map(model =>
          this.options.afterCreate(model, attrs, buildOptions)
        )
      : models;
  }

  getFactory(name, throwError = true) {
    if (!this.factories[name] && throwError) {
      throw new Error(`Invalid factory '${name}' requested`);
    }
    return this.factories[name];
  }

  withOptions(options, merge = false) {
    this.options = merge ? { ...this.options, ...options } : options;
  }

  getAdapter(factory) {
    return factory
      ? this.adapters[factory] || this.defaultAdapter
      : this.defaultAdapter;
  }

  addToCreatedList(adapter, models) {
    if (!Array.isArray(models)) {
      this.created.add([adapter, models]);
    } else {
      for (const model of models) {
        this.created.add([adapter, model]);
      }
    }
    return models;
  }

  cleanUp() {
    const createdArray = [];
    for (const c of this.created) {
      createdArray.push(c);
    }
    createdArray.forEach(([adapter, model]) =>
      adapter.destroy(model, model.constructor)
    );
    this.created.clear();
    this.resetSeq();
  }

  setAdapter(adapter, factoryNames = null) {
    if (!factoryNames) {
      this.defaultAdapter = adapter;
    } else {
      factoryNames = Array.isArray(factoryNames)
        ? factoryNames
        : [factoryNames];
      factoryNames.forEach(name => {
        this.adapters[name] = adapter;
      });
    }
    return adapter;
  }
}

export function generatorThunk(factoryGirl, SomeGenerator) {
  const generator = new SomeGenerator(factoryGirl);
  return (...args) => () => generator.generate(...args);
}

function deprecate(method, see) {
  return () => {
    throw new Error(
      `The ${method} method has been deprecated, use ${see} instead`
    );
  };
}
