var Factory = require('..').Factory;
require('chai').should();

/**
 * @param adapter The adapter to test
 * @param Model A Model definition that has one attribute called 'name'
 * @param countModels A function that returns a count of all Model instances
 * @param {Function} [instanceOf] A <tt>function(model, Model)</tt> that returns true if
 * <tt>model instanceof Model</tt>
 */
module.exports = function(adapter, Model, countModels, instanceOf) {
  instanceOf = instanceOf || function(model, Model) {
    return model instanceof Model;
  };
  var factory = new Factory();
  factory.setAdapter(adapter);

  beforeEach(function() {
    factory.define('model', Model, {
      name: 'Rudy'
    });
  });

  it('builds a new unsaved model', function(done) {
    factory.build('model', function(err, model) {
      if (err) return done(err);
      instanceOf(model, Model).should.be.true;
      adapter.get(model, 'name').should.equal('Rudy');

      countModels(function(err, length) {
        if (err) return done(err);
        length.should.equal(0);
        done();
      });
    });
  });

  it('creates a saved model', function(done) {
    factory.create('model', function(err, model) {
      if (err) return done(err);
      instanceOf(model, Model).should.be.true;
      adapter.get(model, 'name').should.equal('Rudy');

      countModels(function(err, length) {
        if (err) return done(err);
        length.should.equal(1);
        done();
      });
    });
  });

  it('cleans up saved models', function(done) {
    factory.create('model', function(err, model) {
      if (err) return done(err);
      factory.cleanup(function(err) {
        if (err) return done(err);
        countModels(function(err, length) {
          if (err) return done(err);
          length.should.equal(0);
          done();
        });
      });
    });
  });
};
