import './test-helper/testUtils';
import Factory from '../src/SyncFactory';
import { expect } from 'chai';
import DummyModel from './test-helper/DummySyncModel';
import DummyAdapter from './test-helper/DummySyncAdapter';

import sinon from 'sinon';

describe('sync Factory', function () {
  describe('#constructor', function () {
    it('can be created', function () {
      const initializer = {};
      const options = {};
      const factory = new Factory(DummyModel, initializer, options);
      expect(factory).to.be.instanceof(Factory);
      expect(factory.Model).to.be.equal(DummyModel);
      expect(factory.initializer).to.be.equal(initializer);
    });

    it('can be created without options', function () {
      const factory = new Factory(DummyModel, {});
      expect(factory).to.be.instanceof(Factory);
    });

    it('validates Model', function () {
      /* eslint-disable no-new */
      function noModel() {
        new Factory();
      }

      function invalidModel() {
        new Factory(2);
      }

      function validModel() {
        new Factory(DummyModel, {});
      }

      /* eslint-enable no-new */

      expect(noModel).to.throw(Error);
      expect(invalidModel).to.throw(Error);
      expect(validModel).to.not.throw(Error);
    });

    it('validates initializer', function () {
      /* eslint-disable no-new */
      function noInitializer() {
        new Factory(DummyModel);
      }

      function invalidInitializer() {
        new Factory(DummyModel, 3);
      }

      function objectInitializer() {
        new Factory(DummyModel, {});
      }

      function functionInitializer() {
        new Factory(DummyModel, function () {});
      }

      /* eslint-enable no-new */

      expect(noInitializer).to.throw(Error);
      expect(invalidInitializer).to.throw(Error);
      expect(objectInitializer).to.not.throw(Error);
      expect(functionInitializer).to.not.throw(Error);
    });
  });

  const simpleObjInit = {
    name: 'Bruce',
    age: 42,
    address: {
      address1: 'Some Address 1',
      address2: 'Some Address 2',
    },
  };

  const simpleFuncInit = function () {
    return { ...simpleObjInit };
  };

  const objFactory = new Factory(DummyModel, simpleObjInit);
  const dummyAdapter = new DummyAdapter();

  describe('#getFactoryAttrs', function () {
    it('resolves to a copy of factoryAttrs', function () {
      const factory = new Factory(DummyModel, simpleObjInit);
      const attrs = factory.getFactoryAttrs();
      expect(attrs).to.be.eql(simpleObjInit);
      expect(attrs).to.be.not.equal(simpleObjInit);
    });

    it('resolves to return value of initializer function', function () {
      const factory = new Factory(DummyModel, simpleFuncInit);
      const attrs = factory.getFactoryAttrs();
      expect(attrs).to.be.eql(simpleObjInit);
      expect(attrs).to.be.not.equal(simpleObjInit);
    });

    it('calls initializer function with buildOptions', function () {
      const spy = sinon.spy(simpleFuncInit);
      const dummyBuildOptions = {};
      const factory = new Factory(DummyModel, spy);
      factory.getFactoryAttrs(dummyBuildOptions);
      expect(spy).to.have.been.calledOnce;
      expect(spy).to.have.been.calledWith(dummyBuildOptions);
    });
  });

  describe('#attrs', function () {
    it('calls #getFactoryAttrs with buildOptions', function () {
      const spy = sinon.spy(objFactory, 'getFactoryAttrs');
      const dummyBuildOptions = {};
      objFactory.attrs({}, dummyBuildOptions);
      expect(spy).to.have.been.calledWith(dummyBuildOptions);
      objFactory.getFactoryAttrs.restore();
    });

    it('populates with factoryAttrs', function () {
      const attrs = objFactory.attrs();
      expect(attrs).to.be.eql(simpleObjInit);
    });

    it('overrides with passed attrs', function () {
      const overrides = {
        age: 24,
        address: {
          address1: 'Some Address Override',
        },
      };
      const attrs = objFactory.attrs(overrides);
      expect(attrs).to.be.eql({
        name: 'Bruce',
        age: 24,
        address: {
          address1: 'Some Address Override',
        },
      });
    });

    it('preserves Dates and other object types', function () {
      function Foo() {}
      const init = {
        date: new Date(),
        foo: new Foo(),
        function: () => new Foo(),
      };
      const factory = new Factory(DummyModel, init);
      const attrs = factory.attrs();
      expect(attrs.date).to.be.eql(init.date);
      expect(attrs.foo).to.be.eql(init.foo);
      expect(attrs.function).to.be.instanceOf(Foo);
    });
  });

  describe('#build', function () {
    it('calls attrs to get attributes', function () {
      const spy = sinon.spy(objFactory, 'attrs');
      const dummyAttrs = {};
      const dummyBuildOptions = {};
      objFactory.build(dummyAdapter, dummyAttrs, dummyBuildOptions);
      expect(spy).to.have.been.calledWith(dummyAttrs, dummyBuildOptions);
      objFactory.attrs.restore();
    });

    it('calls build on adapter with Model and attrs', function () {
      const spy = sinon.spy(dummyAdapter, 'build');
      objFactory.build(dummyAdapter);
      expect(spy).to.have.been.calledWith(
        DummyModel,
        sinon.match(simpleObjInit)
      );
      dummyAdapter.build.restore();
    });

    it('resolves to a Model instance', function () {
      const model = objFactory.build(dummyAdapter);
      expect(model).to.be.an.instanceof(DummyModel);
    });

    it('invokes afterBuild callback option if any', function () {
      const spy = sinon.spy(model => model);
      const factoryWithOptions = new Factory(DummyModel, simpleObjInit, {
        afterBuild: spy,
      });
      const dummyAttrs = {};
      const dummyBuildOptions = {};
      const model = factoryWithOptions.build(
        dummyAdapter,
        dummyAttrs,
        dummyBuildOptions
      );
      expect(spy).to.have.been.calledWith(model, dummyAttrs, dummyBuildOptions);
    });
  });

  describe('#create', function () {
    it('calls build to build the model', function () {
      const spy = sinon.spy(objFactory, 'build');
      const dummyAttrs = {};
      const dummyBuildOptions = {};
      objFactory.create(dummyAdapter, dummyAttrs, dummyBuildOptions);
      expect(spy).to.have.been.calledWith(dummyAttrs, dummyBuildOptions);
      objFactory.build.restore();
    });

    it('calls save on adapter with Model and model', function () {
      const spy = sinon.spy(dummyAdapter, 'save');
      objFactory.create(dummyAdapter);
      expect(spy).to.have.been.calledWith(
        sinon.match(new DummyModel(simpleObjInit)),
        DummyModel
      );
      dummyAdapter.save.restore();
    });

    it('resolves to a Model instance', function () {
      const model = objFactory.create(dummyAdapter);
      expect(model).to.be.an.instanceof(DummyModel);
    });

    it('invokes afterCreate callback option if any', function () {
      const spy = sinon.spy(model => model);
      const factoryWithOptions = new Factory(DummyModel, simpleObjInit, {
        afterCreate: spy,
      });
      const dummyAttrs = {};
      const dummyBuildOptions = {};
      const model = factoryWithOptions.create(
        dummyAdapter,
        dummyAttrs,
        dummyBuildOptions
      );
      expect(spy).to.have.been.calledWith(model, dummyAttrs, dummyBuildOptions);
    });

    it('invokes afterBuild callback on create', function () {
      const spy = sinon.spy(model => model);
      const factoryWithOptions = new Factory(DummyModel, simpleObjInit, {
        afterBuild: spy,
      });
      factoryWithOptions.create(dummyAdapter);
      expect(spy).to.have.callCount(1);
    });
  });

  describe('#buildMany', function () {
    it('calls attrsMany to get model attrs', function () {
      const spy = sinon.spy(objFactory, 'attrsMany');
      const dummyAttrs = {};
      const dummyBuildOptions = {};
      objFactory.buildMany(dummyAdapter, 5, dummyAttrs, dummyBuildOptions);
      expect(spy).to.have.been.calledWith(5, dummyAttrs, dummyBuildOptions);
      objFactory.attrsMany.restore();
    });

    it('calls build on adapter with Model and each model attrs', function () {
      const spy = sinon.spy(dummyAdapter, 'build');
      objFactory.buildMany(dummyAdapter, 5);
      expect(spy).to.have.callCount(5);
      expect(spy).to.have.been.calledWith(
        DummyModel,
        sinon.match(simpleObjInit)
      );
      dummyAdapter.build.restore();
    });

    it('resolves to an array of Model instances', function () {
      const models = objFactory.buildMany(dummyAdapter, 5);
      expect(models).to.be.an('array');
      expect(models).to.have.lengthOf(5);
      models.forEach(function (model) {
        expect(model).to.be.an.instanceof(DummyModel);
      });
    });

    it('invokes afterBuild callback option if any for each model', function () {
      const spy = sinon.spy(model => model);
      const factoryWithOptions = new Factory(DummyModel, simpleObjInit, {
        afterBuild: spy,
      });
      const dummyAttrs = {};
      const dummyBuildOptions = {};
      const models = factoryWithOptions.buildMany(
        dummyAdapter,
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
  });

  describe('#createMany', function () {
    it('calls buildMany to build models', function () {
      const spy = sinon.spy(objFactory, 'buildMany');
      const dummyAttrs = {};
      const dummyBuildOptions = {};
      objFactory.createMany(dummyAdapter, 5, dummyAttrs, dummyBuildOptions);
      expect(spy).to.have.been.calledWith(
        dummyAdapter,
        5,
        dummyAttrs,
        dummyBuildOptions
      );
      objFactory.buildMany.restore();
    });

    it('calls save on adapter with Model and each model', function () {
      const spy = sinon.spy(dummyAdapter, 'save');
      objFactory.createMany(dummyAdapter, 5);
      expect(spy).to.have.callCount(5);
      expect(spy).to.have.been.calledWith(
        sinon.match(new DummyModel(simpleObjInit)),
        DummyModel
      );
      dummyAdapter.save.restore();
    });

    it('resolves to an array of Model instances', function () {
      const models = objFactory.createMany(dummyAdapter, 5);
      expect(models).to.be.an('array');
      expect(models).to.have.lengthOf(5);
      models.forEach(function (model) {
        expect(model).to.be.an.instanceof(DummyModel);
      });
    });

    it('invokes afterCreate callback option if any for each model', function () {
      const spy = sinon.spy(model => model);
      const factoryWithOptions = new Factory(DummyModel, simpleObjInit, {
        afterCreate: spy,
      });
      const dummyAttrs = {};
      const dummyBuildOptions = {};
      const models = factoryWithOptions.createMany(
        dummyAdapter,
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

    it('invokes afterBuild callback on createMany', function () {
      const spy = sinon.spy(model => model);
      const factoryWithOptions = new Factory(DummyModel, simpleObjInit, {
        afterBuild: spy,
      });
      factoryWithOptions.createMany(dummyAdapter, 2);
      expect(spy).to.have.callCount(2);
    });

    it('accepts an array of attrs', function () {
      const models = objFactory.createMany(dummyAdapter, [
        { name: 'One' },
        { name: 'Two' },
      ]);
      expect(models[0].get('name')).to.equal('One');
      expect(models[1].get('name')).to.equal('Two');
    });
  });

  describe('#attrsMany', function () {
    it('validates number of objects', function () {
      const noNumP = () => objFactory.attrsMany();
      const invalidNumP = () => objFactory.attrsMany('alpha');
      const lessThanOneNumP = () => objFactory.attrsMany(0);
      const validNumP = () => objFactory.attrsMany(10);
      expect(noNumP).to.throw;
      expect(invalidNumP).to.throw;
      expect(lessThanOneNumP).to.throw;
      expect(validNumP).to.throw;
    });

    it('validates attrsArray', function () {
      const noAttrsArrayP = () => objFactory.attrsMany(10);
      const arrayAttrsArrayP = () => objFactory.attrsMany(10, [{ a: 1 }]);
      const objectAttrsArrayP = () => objFactory.attrsMany(10, { b: 2 });
      const invalidAttrsArrayP = () => objFactory.attrsMany(10, 'woops');

      expect(noAttrsArrayP).to.not.throw;
      expect(arrayAttrsArrayP).to.not.throw;
      expect(objectAttrsArrayP).to.not.throw;
      expect(invalidAttrsArrayP).to.throw;
    });

    it('validates buildOptionsArray', function () {
      const noBuildOptionsArrayP = () => objFactory.attrsMany(10, []);
      const arrayBuildOptionsArrayP = () => objFactory.attrsMany(10, [], [{ a: 1 }]);
      const objectBuildOptionsArrayP = () => objFactory.attrsMany(10, [], { b: 2 });
      const invalidBuildOptionsArrayP = () => objFactory.attrsMany(10, [], 'woops');

      expect(noBuildOptionsArrayP).to.not.throw;
      expect(arrayBuildOptionsArrayP).to.not.throw;
      expect(objectBuildOptionsArrayP).to.not.throw;
      expect(invalidBuildOptionsArrayP).to.throw;
    });

    it('calls attrs for each model attr', function () {
      const spy = sinon.spy(objFactory, 'attrs');
      objFactory.attrsMany(10);
      expect(spy).to.have.callCount(10);
      objFactory.attrs.restore();
    });

    it('passes same attrObject and buildOptionsObject for each model attr', function () {
      const spy = sinon.spy(objFactory, 'attrs');

      const dummyAttrObject = {};
      const dummyBuildOptionsObject = {};

      objFactory.attrsMany(10, dummyAttrObject, dummyBuildOptionsObject);

      expect(spy).to.have.callCount(10);

      spy.args.forEach(function (argsArray) {
        expect(argsArray[0]).to.be.equal(dummyAttrObject);
        expect(argsArray[1]).to.be.equal(dummyBuildOptionsObject);
      });

      objFactory.attrs.restore();
    });

    it('passes attrObject and buildOptions object from arrays to attrs', function () {
      const spy = sinon.spy(objFactory, 'attrs');

      const dummyAttrArray = [];
      const dummyBuildOptionsArray = [];

      for (let i = 0; i < 10; i++) {
        dummyAttrArray[i] = { a: i };
        dummyBuildOptionsArray[i] = { b: i };
      }

      objFactory.attrsMany(10, dummyAttrArray, dummyBuildOptionsArray);

      expect(spy).to.have.callCount(10);
      spy.args.forEach(function (argsArray, i) {
        expect(argsArray[0]).to.be.eql({ a: i });
        expect(argsArray[1]).to.be.eql({ b: i });
      });
      objFactory.attrs.restore();
    });
  });
});
