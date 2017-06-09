import '../test-helper/testUtils';
import ObjectionAdapter from '../../src/adapters/ObjectionAdapter';
import { expect } from 'chai';
import DummyModel from '../test-helper/DummyObjectionModel';
import asyncFunction from '../test-helper/asyncFunction';

describe('ObjectionAdapter', function () {
  it('can be created', function () {
    const adapter = new ObjectionAdapter;
    expect(adapter).to.be.an.instanceof(ObjectionAdapter);
  });

  const adapter = new ObjectionAdapter;

  describe('#build', function () {
    it('builds the model', asyncFunction(async function () {
      const model = adapter.build(DummyModel, {});
      expect(model).to.be.an.instanceof(DummyModel);
    }));
  });

  describe('#save', function () {
    it('calls save on the model', asyncFunction(async function () {
      const model = new DummyModel;
      const savedModel = await adapter.save(model, DummyModel);
      expect(savedModel).to.be.equal(model);
    }));

    it('returns a promise', function () {
      const model = new DummyModel;
      const savedModelP = adapter.save(model, DummyModel);
      expect(savedModelP.then).to.be.a('function');
      return expect(savedModelP).to.be.eventually.fulfilled;
    });
  });

  describe('#destroy', function () {
    it('calls destroy on the model', asyncFunction(async function () {
      const model = new DummyModel;
      const destroyedModel = await adapter.destroy(model, DummyModel);
      expect(destroyedModel).to.be.equal(1);
    }));

    it('returns a promise', function () {
      const model = new DummyModel;
      const destroyedModelP = adapter.destroy(model, DummyModel);
      expect(destroyedModelP.then).to.be.a('function');
      return expect(destroyedModelP).to.be.eventually.fulfilled;
    });
  });
});
