var Backbone = require('backbone');
var Adapter = require('../lib/backbone-adapter');
var tests = require('./backbone-adapter-tests');
var should = require('should');
var context = describe;

var TestAdapter = function() {
  this.db = [];
};
TestAdapter.prototype = new Adapter();
TestAdapter.prototype.save = function(doc, Model, cb) {
  this.db.push(doc);
  process.nextTick(function() {
    cb(null, doc);
  });
};
TestAdapter.prototype.destroy = function(doc, Model, cb) {
  var db = this.db;
  var i = db.indexOf(doc);
  if (i != -1) this.db = db.slice(0, i).concat(db.slice(i + 1));
  process.nextTick(cb);
};

describe('test backbone adapter', function() {
  var adapter = new TestAdapter();
  tests(adapter, Backbone.Model, countModels);
  function countModels(cb) {
    process.nextTick(function() {
      cb(null, adapter.db.length);
    });
  }
});
