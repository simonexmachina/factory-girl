import './test-helper/testUtils';
import FactoryGirl from '../src/SyncFactoryGirl';
import Factory from '../src/SyncFactory';
import DefaultAdapter from '../src/adapters/DefaultSyncAdapter';
import Sequence from '../src/generatorsSync/Sequence';
import { expect } from 'chai';
import DummyModel from './test-helper/DummySyncModel';
import DummyAdapter from './test-helper/DummySyncAdapter';
import sinon from 'sinon';

describe('SyncFactoryGirl', function () {
  describe('#constructor', function () {
    const factoryGirl = new FactoryGirl();
    it('can be created', function () {
      expect(factoryGirl).to.be.an.instanceof(FactoryGirl);
    });

    it('defines generator methods', function () {
      expect(factoryGirl.assoc).to.be.a('function');
      expect(factoryGirl.assocMany).to.be.a('function');
      expect(factoryGirl.assocAttrs).to.be.a('function');
      expect(factoryGirl.assocAttrsMany).to.be.a('function');
      expect(factoryGirl.sequence).to.be.a('function');
      expect(factoryGirl.seq).to.be.a('function');
      expect(factoryGirl.resetSeq).to.be.a('function');
      expect(factoryGirl.resetSequence).to.be.a('function');
      expect(factoryGirl.chance).to.be.a('function');
      expect(factoryGirl.oneOf).to.be.a('function');
    });

    it('defines default adapter', function () {
      expect(factoryGirl.getAdapter()).to.be.an.instanceof(DefaultAdapter);
    });
  });

  describe('deprecated methods', function () {
    const factoryGirl = new FactoryGirl();
    it('throws error on calling deprecated methods', function () {
      function assocBuild() {
        factoryGirl.assocBuild('whatever');
      }

      function assocBuildMany() {
        factoryGirl.assocBuildMany('whatever', 2);
      }

      expect(assocBuild).to.throw(Error);
      expect(assocBuildMany).to.throw(Error);
    });
  });

  describe('#define', function () {
    const factoryGirl = new FactoryGirl();
    it('can define factory', function () {
      factoryGirl.define('factory1', DummyModel, {});
      expect(factoryGirl.getFactory('factory1', false)).to.exist;
      expect(factoryGirl.getFactory('factory1', false)).to.be.an.instanceof(
        Factory
      );
    });

    it('can not define factory with same name', function () {
      function nameRepeated() {
        factoryGirl.define('factory1', DummyModel, {});
      }

      expect(nameRepeated).to.throw(Error);
    });
  });

  describe('#extend', function () {
    let factoryGirl;
    beforeEach(function () {
      factoryGirl = new FactoryGirl();
      factoryGirl.define('parent', DummyModel, {
        parent: true,
        override: 'parent',
      });
    });

    it('can extend defined factory', function () {
      factoryGirl.extend('parent', 'factory1', {
        child: true,
        override: 'child',
      });
      expect(factoryGirl.getFactory('factory1', false)).to.exist;
      expect(factoryGirl.getFactory('factory1', false)).to.be.an.instanceof(
        Factory
      );
      const model = factoryGirl.build('factory1');
      expect(model).to.be.an.instanceOf(Object);
      expect(model.attrs.parent).to.equal(true, 'initializer is inherited');
      expect(model.attrs.child).to.equal(true, 'child initializer');
      expect(model.attrs.override).to.equal('child', 'child overrides parent');
    });

    it('model can be overridden', function () {
      factoryGirl.extend(
        'parent',
        'factory1',
        {
          child: true,
          override: 'child',
        },
        {
          model: Object,
        }
      );
      const model = factoryGirl.build('factory1');
      expect(model).to.be.an.instanceOf(Object);
    });

    it('can not define factory with same name', function () {
      function nameRepeated() {
        factoryGirl.extend('parent', 'parent', {});
      }
      expect(nameRepeated).to.throw(Error);
    });

    it('can extend with an initializer function', function () {
      factoryGirl.define('parentWithObjectInitializer', Object, {
        parent: true,
      });
      factoryGirl.extend(
        'parentWithObjectInitializer',
        'childWithFunctionInitializer',
        function (buildOptions) {
          return { child: true, option: buildOptions.option };
        }
      );
      const model = factoryGirl.build(
        'childWithFunctionInitializer',
        {},
        { option: true }
      );
      expect(model.parent).to.equal(true, 'parent initializer');
      expect(model.child).to.equal(true, 'child initializer');
      expect(model.option).to.equal(true, 'build options');
    });

    it('can extend a parent that has an initializer function', function () {
      factoryGirl.define('parentWithFunctionInitializer', Object, function (
        buildOptions
      ) {
        return { parent: true, option: buildOptions.option };
      });
      factoryGirl.extend(
        'parentWithFunctionInitializer',
        'childWithObjectInitializer',
        { child: true }
      );
      const model = factoryGirl.build(
        'childWithObjectInitializer',
        {},
        { option: true }
      );
      expect(model.parent).to.equal(true, 'parent initializer');
      expect(model.child).to.equal(true, 'child initializer');
      expect(model.option).to.equal(true, 'build options');
    });
  });

  describe('#getFactory', function () {
    const factoryGirl = new FactoryGirl();
    factoryGirl.define('factory1', DummyModel, {});

    it('returns requested factory', function () {
      const factory = factoryGirl.getFactory('factory1');
      expect(factory).to.exist;
      expect(factory).to.be.an.instanceof(Factory);
    });

    it('throws error if factory does not exists', function () {
      function factoryNotExists() {
        factoryGirl.getFactory('factory2');
      }

      expect(factoryNotExists).to.throw(Error);
    });
  });

  describe('#setAdapter', function () {
    it('sets the default adapter', function () {
      const factoryGirl = new FactoryGirl();
      expect(factoryGirl.getAdapter()).to.be.an.instanceof(DefaultAdapter);
      const dummyAdapter = new DummyAdapter();
      factoryGirl.setAdapter(dummyAdapter);
      expect(factoryGirl.getAdapter()).to.be.an.instanceof(DummyAdapter);
    });

    it('sets adapter for factories correctly', function () {
      const factoryGirl = new FactoryGirl();
      factoryGirl.define('factory1', DummyModel, {});
      factoryGirl.define('factory2', DummyModel, {});

      expect(factoryGirl.getAdapter('factory1')).to.be.an.instanceof(
        DefaultAdapter
      );

      expect(factoryGirl.getAdapter('factory2')).to.be.an.instanceof(
        DefaultAdapter
      );

      const dummyAdapter = new DummyAdapter();
      factoryGirl.setAdapter(dummyAdapter, 'factory1');

      expect(factoryGirl.getAdapter('factory1')).to.be.an.instanceof(
        DummyAdapter
      );

      expect(factoryGirl.getAdapter('factory2')).to.be.an.instanceof(
        DefaultAdapter
      );

      expect(factoryGirl.getAdapter()).to.be.an.instanceof(DefaultAdapter);
    });

    it('sets adapter for multiple factories', function () {
      const factoryGirl = new FactoryGirl();
      factoryGirl.define('factory1', DummyModel, {});
      factoryGirl.define('factory2', DummyModel, {});

      expect(factoryGirl.getAdapter('factory1')).to.be.an.instanceof(
        DefaultAdapter
      );

      expect(factoryGirl.getAdapter('factory2')).to.be.an.instanceof(
        DefaultAdapter
      );

      const dummyAdapter = new DummyAdapter();

      factoryGirl.setAdapter(dummyAdapter, ['factory1', 'factory2']);

      expect(factoryGirl.getAdapter('factory1')).to.be.an.instanceof(
        DummyAdapter
      );

      expect(factoryGirl.getAdapter('factory2')).to.be.an.instanceof(
        DummyAdapter
      );

      expect(factoryGirl.getAdapter()).to.be.an.instanceof(DefaultAdapter);
    });
  });

  describe('#getAdapter', function () {
    const factoryGirl = new FactoryGirl();
    factoryGirl.define('factory1', DummyModel, {});
    factoryGirl.define('factory2', DummyModel, {});
    const dummyAdapter = new DummyAdapter();
    factoryGirl.setAdapter(dummyAdapter, 'factory1');

    it('gets adapter correctly', function () {
      const adapter1 = factoryGirl.getAdapter('factory2');
      expect(adapter1).to.be.equal(factoryGirl.getAdapter());
      const adapter2 = factoryGirl.getAdapter('factory1');
      expect(adapter2).to.be.equal(dummyAdapter);
    });
  });

  describe('#attrs', function () {
    const factoryGirl = new FactoryGirl();
    factoryGirl.define('factory1', DummyModel, { name: 'Mark', age: 40 });

    it('requests correct factory', function () {
      const spy = sinon.spy(factoryGirl, 'getFactory');
      factoryGirl.attrs('factory1');
      expect(spy).to.have.been.calledWith('factory1');
      factoryGirl.getFactory.restore();
    });

    it('calls attrs on the factory with attrs and buildOptions', function () {
      const factory = factoryGirl.getFactory('factory1');
      const spy = sinon.spy(factory, 'attrs');
      const dummyAttrs = {};
      const dummyBuildOptions = {};
      factoryGirl.attrs('factory1', dummyAttrs, dummyBuildOptions);
      expect(spy).to.have.been.calledWith(dummyAttrs, dummyBuildOptions);
      factory.attrs.restore();
    });

    it('resolves to attrs correctly', function () {
      const attrs = factoryGirl.attrs('factory1');
      expect(attrs).to.be.eql({
        name: 'Mark',
        age: 40,
      });
    });
  });

  describe('#build', function () {
    const factoryGirl = new FactoryGirl();
    factoryGirl.define('factory1', DummyModel, { name: 'Mark', age: 40 });

    it('requests correct factory and adapter', function () {
      const spy1 = sinon.spy(factoryGirl, 'getFactory');
      const spy2 = sinon.spy(factoryGirl, 'getAdapter');
      factoryGirl.build('factory1');
      expect(spy1).to.have.been.calledWith('factory1');
      expect(spy2).to.have.been.calledWith('factory1');
      factoryGirl.getFactory.restore();
      factoryGirl.getAdapter.restore();
    });

    it('calls build on the factory with adapter, attrs and buildOptions', function () {
      const factory = factoryGirl.getFactory('factory1');
      const spy = sinon.spy(factory, 'build');
      const dummyAttrs = {};
      const dummyBuildOptions = {};
      const adapter = factoryGirl.getAdapter('factory1');
      factoryGirl.build('factory1', dummyAttrs, dummyBuildOptions);
      expect(spy).to.have.been.calledWith(
        adapter,
        dummyAttrs,
        dummyBuildOptions
      );
      factory.build.restore();
    });

    it('resolves to model correctly', function () {
      const model = factoryGirl.build('factory1');
      expect(model).to.be.an.instanceof(DummyModel);
      expect(model.attrs.name).to.be.equal('Mark');
      expect(model.attrs.age).to.be.equal(40);
    });

    it('invokes afterBuild callback option if any', function () {
      const spy = sinon.spy(model => model);
      factoryGirl.withOptions({ afterBuild: spy });
      const dummyAttrs = {};
      const dummyBuildOptions = {};
      const model = factoryGirl.build(
        'factory1',
        dummyAttrs,
        dummyBuildOptions
      );
      expect(spy).to.have.been.calledWith(model, dummyAttrs, dummyBuildOptions);
    });

    it('accepts afterBuild callback returning', function () {
      factoryGirl.withOptions({
        afterBuild: model => model,
      });
      const model = factoryGirl.build('factory1');
      expect(model).to.be.an.instanceof(DummyModel);
    });
  });

  describe('#create', function () {
    const factoryGirl = new FactoryGirl();
    factoryGirl.define('factory1', DummyModel, { name: 'Mark', age: 40 });

    it('requests correct factory and adapter', function () {
      const spy1 = sinon.spy(factoryGirl, 'getFactory');
      const spy2 = sinon.spy(factoryGirl, 'getAdapter');
      factoryGirl.create('factory1');
      expect(spy1).to.have.been.calledWith('factory1');
      expect(spy2).to.have.been.calledWith('factory1');
      factoryGirl.getFactory.restore();
      factoryGirl.getAdapter.restore();
    });

    it('calls create on the factory with adapter, attrs and buildOptions', function () {
      const factory = factoryGirl.getFactory('factory1');
      const spy = sinon.spy(factory, 'create');
      const dummyAttrs = {};
      const dummyBuildOptions = {};
      const adapter = factoryGirl.getAdapter('factory1');
      factoryGirl.create('factory1', dummyAttrs, dummyBuildOptions);
      expect(spy).to.have.been.calledWith(
        adapter,
        dummyAttrs,
        dummyBuildOptions
      );
      factory.create.restore();
    });

    it('resolves to model correctly', function () {
      const model = factoryGirl.create('factory1');
      expect(model).to.be.an.instanceof(DummyModel);
      expect(model.attrs.name).to.be.equal('Mark');
      expect(model.attrs.age).to.be.equal(40);
    });

    it('invokes afterCreate callback option if any', function () {
      const spy = sinon.spy(model => model);
      factoryGirl.withOptions({ afterCreate: spy });
      const dummyAttrs = {};
      const dummyBuildOptions = {};
      const model = factoryGirl.create(
        'factory1',
        dummyAttrs,
        dummyBuildOptions
      );
      expect(spy).to.have.been.calledWith(model, dummyAttrs, dummyBuildOptions);
    });

    it('accepts afterCreate callback returning model', function () {
      factoryGirl.withOptions({
        afterCreate: model => model,
      });
      const model = factoryGirl.create('factory1');
      expect(model).to.be.an.instanceof(DummyModel);
    });
  });

  describe('#attrsMany', function () {
    const factoryGirl = new FactoryGirl();
    factoryGirl.define('factory1', DummyModel, { name: 'Mark', age: 40 });

    it('requests correct factory', function () {
      const spy = sinon.spy(factoryGirl, 'getFactory');
      factoryGirl.attrsMany('factory1', 10);
      expect(spy).to.have.been.calledWith('factory1');
      factoryGirl.getFactory.restore();
    });

    it('calls attrsMany on the factory with num, attrs and buildOptions', function () {
      const factory = factoryGirl.getFactory('factory1');
      const spy = sinon.spy(factory, 'attrsMany');
      const dummyAttrs = {};
      const dummyBuildOptions = {};
      factoryGirl.attrsMany('factory1', 10, dummyAttrs, dummyBuildOptions);
      expect(spy).to.have.been.calledWith(10, dummyAttrs, dummyBuildOptions);
      factory.attrsMany.restore();
    });

    it('resolves to attrs array correctly', function () {
      const attrs = factoryGirl.attrsMany('factory1', 10);
      expect(attrs).to.be.an('array');
      expect(attrs).to.have.lengthOf(10);
      attrs.forEach(function (attr) {
        expect(attr).to.be.eql({
          name: 'Mark',
          age: 40,
        });
      });
    });
  });

  describe('#buildMany', function () {
    const factoryGirl = new FactoryGirl();
    factoryGirl.define('factory1', DummyModel, { name: 'Mark', age: 40 });

    it('requests correct factory and adapter', function () {
      const spy1 = sinon.spy(factoryGirl, 'getFactory');
      const spy2 = sinon.spy(factoryGirl, 'getAdapter');
      factoryGirl.buildMany('factory1', 2);
      expect(spy1).to.have.been.calledWith('factory1');
      expect(spy2).to.have.been.calledWith('factory1');
      factoryGirl.getFactory.restore();
      factoryGirl.getAdapter.restore();
    });

    it('calls factory#buildMany with adapter, num, attrs and buildOptions', function () {
      const factory = factoryGirl.getFactory('factory1');
      const spy = sinon.spy(factory, 'buildMany');
      const dummyAttrs = {};
      const dummyBuildOptions = {};
      const adapter = factoryGirl.getAdapter('factory1');
      factoryGirl.buildMany('factory1', 5, dummyAttrs, dummyBuildOptions);
      expect(spy).to.have.been.calledWith(
        adapter,
        5,
        dummyAttrs,
        dummyBuildOptions
      );
      factory.buildMany.restore();
    });

    it('resolves to models array correctly', function () {
      const models = factoryGirl.buildMany('factory1', 5);
      expect(models).to.be.an('array');
      models.forEach(function (model) {
        expect(model).to.be.an.instanceof(DummyModel);
        expect(model.attrs.name).to.be.equal('Mark');
        expect(model.attrs.age).to.be.equal(40);
      });
    });

    it('invokes afterBuild callback option if any for each model', function () {
      const spy = sinon.spy(model => model);
      factoryGirl.withOptions({ afterBuild: spy });
      const dummyAttrs = {};
      const dummyBuildOptions = {};
      const models = factoryGirl.buildMany(
        'factory1',
        5,
        dummyAttrs,
        dummyBuildOptions
      );
      expect(spy).to.have.callCount(5);
      for (let i = 0; i < 5; i++) {
        expect(spy.getCall(i)).to.have.been.calledWith(
          models[i],
          dummyAttrs,
          dummyBuildOptions
        );
      }
    });

    it('accepts afterBuild callback returning', function () {
      factoryGirl.withOptions({
        afterBuild: model => model,
      });
      const models = factoryGirl.buildMany('factory1', 5);
      expect(models).to.be.an('array');
      models.forEach(function (model) {
        expect(model).to.be.an.instanceof(DummyModel);
      });
    });
  });

  describe('#createMany', function () {
    const factoryGirl = new FactoryGirl();
    factoryGirl.define('factory1', DummyModel, { name: 'Mark', age: 40 });

    it('requests correct factory and adapter', function () {
      const spy1 = sinon.spy(factoryGirl, 'getFactory');
      const spy2 = sinon.spy(factoryGirl, 'getAdapter');
      factoryGirl.createMany('factory1', 2);
      expect(spy1).to.have.been.calledWith('factory1');
      expect(spy2).to.have.been.calledWith('factory1');
      factoryGirl.getFactory.restore();
      factoryGirl.getAdapter.restore();
    });

    it('calls factory#createMany with adapter, num, attrs and buildOptions', function () {
      const factory = factoryGirl.getFactory('factory1');
      const spy = sinon.spy(factory, 'createMany');
      const dummyAttrs = {};
      const dummyBuildOptions = {};
      const adapter = factoryGirl.getAdapter('factory1');
      factoryGirl.createMany('factory1', 5, dummyAttrs, dummyBuildOptions);
      expect(spy).to.have.been.calledWith(
        adapter,
        5,
        dummyAttrs,
        dummyBuildOptions
      );
      factory.createMany.restore();
    });

    it('resolves to models array correctly', function () {
      const models = factoryGirl.createMany('factory1', 5);
      expect(models).to.be.an('array');
      models.forEach(function (model) {
        expect(model).to.be.an.instanceof(DummyModel);
        expect(model.attrs.name).to.be.equal('Mark');
        expect(model.attrs.age).to.be.equal(40);
      });
    });

    it('invokes afterCreate callback option if any for each model', function () {
      const spy = sinon.spy(model => model);
      factoryGirl.withOptions({ afterCreate: spy });
      const dummyAttrs = {};
      const dummyBuildOptions = {};
      const models = factoryGirl.createMany(
        'factory1',
        5,
        dummyAttrs,
        dummyBuildOptions
      );
      expect(spy).to.have.callCount(5);
      for (let i = 0; i < 5; i++) {
        expect(spy.getCall(i)).to.have.been.calledWith(
          models[i],
          dummyAttrs,
          dummyBuildOptions
        );
      }
    });

    it('accepts afterCreate callback returning', function () {
      factoryGirl.withOptions({
        afterCreate: model => model,
      });
      const models = factoryGirl.createMany('factory1', 5);
      expect(models).to.be.an('array');
      models.forEach(function (model) {
        expect(model).to.be.an.instanceof(DummyModel);
      });
    });
  });

  describe('#withOptions', function () {
    it('can replace options', function () {
      const factoryGirl = new FactoryGirl({ a: 1 });
      const newOptions = { hello: 'world' };
      factoryGirl.withOptions(newOptions);
      expect(factoryGirl.options).to.be.eql(newOptions);
    });

    it('can merge options', function () {
      const originalOptions = { a: 1 };
      const factoryGirl = new FactoryGirl(originalOptions);
      const newOptions = { hello: 'world' };
      factoryGirl.withOptions(newOptions, true);
      expect(factoryGirl.options).to.be.eql({
        ...originalOptions,
        ...newOptions,
      });
    });
  });

  describe('#addToCreatedList', function () {
    const factoryGirl = new FactoryGirl();
    const dummyAdapter = new DummyAdapter();

    it('adds one model to the list', function () {
      const spy = sinon.spy(factoryGirl.created, 'add');
      const dummyModel = new DummyModel();
      factoryGirl.addToCreatedList(dummyAdapter, dummyModel);
      expect(spy).to.have.been.calledWith([dummyAdapter, dummyModel]);
      factoryGirl.created.add.restore();
    });

    it('adds multiple models to the list', function () {
      const spy = sinon.spy(factoryGirl.created, 'add');
      const dummyModels = [
        new DummyModel(),
        new DummyModel(),
        new DummyModel(),
      ];
      factoryGirl.addToCreatedList(dummyAdapter, dummyModels);
      expect(spy).to.have.callCount(3);
      spy.args.forEach(function (arg, index) {
        expect(arg[0]).to.be.eql([dummyAdapter, dummyModels[index]]);
      });
      factoryGirl.created.add.restore();
    });
  });

  describe('#cleanup', function () {
    it('cleans up the factory', function () {
      const factoryGirl = new FactoryGirl();
      const dummyAdapter = new DummyAdapter();
      const dummyAdapter2 = new DummyAdapter();
      const dummyModels = [
        new DummyModel(),
        new DummyModel(),
        new DummyModel(),
      ];
      const dummyModel1 = new DummyModel();
      const dummyModel2 = new DummyModel();
      const spy1 = sinon.spy(dummyAdapter, 'destroy');
      const spy2 = sinon.spy(dummyAdapter2, 'destroy');
      const spy3 = sinon.spy(factoryGirl.created, 'clear');

      expect(factoryGirl.created.size).to.be.equal(0);
      factoryGirl.addToCreatedList(dummyAdapter, dummyModels);
      factoryGirl.addToCreatedList(dummyAdapter, dummyModel1);
      factoryGirl.addToCreatedList(dummyAdapter2, dummyModel2);
      expect(factoryGirl.created.size).to.be.equal(5);

      Sequence.sequences['some.id.1'] = 2;
      expect(Sequence.sequences['some.id.1']).to.exist;

      factoryGirl.cleanUp();
      expect(spy1).to.have.callCount(4);
      expect(spy2).to.have.callCount(1);
      expect(spy2).to.have.been.calledWith(dummyModel2, DummyModel);
      expect(spy3).to.have.callCount(1);

      expect(factoryGirl.created.size).to.be.equal(0);
      expect(Sequence.sequences['some.id.1']).to.not.exist;
    });
  });
});
