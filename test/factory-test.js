/* global describe, beforeEach, afterEach */
var factory = require('..');
var should = require('should');
var context = describe;

describe('factory', function() {
  var Model, Person, Job;

  before(function() {
    Model = function() {};

    Model.prototype.save = function(callback) {
      this.saveCalled = true;
      callback();
    };
    Model.prototype.destroy = function(callback) {
      this.destroyCalled = true;
      callback();
    };

    Person = function() {};
    Person.prototype = new Model();

    Job = function() {};
    Job.prototype = new Model();
  });

  beforeEach(function() {
    var nameCounter = 1, emailCounter = 1;
    factory.define('person', Person, {
      name: function(cb) {
        process.nextTick(function() { // Zalgo begone!!
          cb(null, "Person " + nameCounter++);
        });
      },
      email: function() {
        return "email" + (emailCounter++) + "@noemail.com";
      },
      age: 25,
      job: factory.assoc('job'),
      title: factory.assoc('job', 'title')
    });

    factory.define('job', Job, {
      title: 'Engineer',
      company: 'Foobar Inc.'
    });
  });

  describe('#build', function() {
    it('builds, but does not save the object', function(done) {
      factory.build('job', function(err, job) {
        (job instanceof Job).should.be.true;
        job.title.should.eql('Engineer');
        job.company.should.eql('Foobar Inc.');
        job.should.not.have.property('saveCalled');
        done();
      });

      context('passing attributes as second argument', function() {
        it('sets them', function(done) {
          factory.build('job', { title: "Artist", company: "Bazqux Co." }, function(err, job) {
            (job instanceof Job).should.be.true;
            job.title.should.eql('Artist');
            job.company.should.eql('Bazqux Co.');
            job.should.not.have.property('saveCalled');
            done();
          });
        });
      });

      context('factory containing an association', function() {
        it('is able to handle that', function(done) {
          factory.build('person', { age: 30 }, function(err, person) {
            (person instanceof Person).should.be.true;
            person.should.not.have.property('saveCalled');
            person.name.should.eql('Person 1');
            person.age.should.eql(30);
            (person.job instanceof Job).should.be.true;
            person.job.title.should.eql('Engineer');
            person.job.company.should.eql('Foobar Inc.');
            person.job.saveCalled.should.be.true;
            person.title.should.eql('Engineer');
            done();
          });
        });
      });
    });
  });

  describe('#create', function() {
    it('builds and saves the object', function(done) {
      factory.create('job', function(err, job) {
        (job instanceof Job).should.be.true;
        job.title.should.eql('Engineer');
        job.company.should.eql('Foobar Inc.');
        job.saveCalled.should.be.true;
        done();
      });
    });

    context('yields errors', function() {

      before(function() {
        var Faulty = function() {};
        Faulty.prototype.save = function(callback) {
          callback(new Error('Save failed'));
        };
        factory.define('faulty', Faulty, {});
      });
      afterEach(function() {
        factory.setAdapter(null, 'faulty');
      });

      it('from the adapter', function(done) {
        var FaultyAdapter = function() {};
        FaultyAdapter.prototype = new factory.Adapter();
        FaultyAdapter.prototype.save = function(doc, Model, cb) {
          cb(new Error('Save failed'));
        };
        factory.setAdapter(new FaultyAdapter(), 'faulty');
        factory.create('faulty', function(err, faulty) {
          (err instanceof Error).should.be.true;
          err.message.should.eql('Save failed');
          done();
        });
      });

      it('from the model', function(done) {
        factory.create('faulty', function(err, faulty) {
          (err instanceof Error).should.be.true;
          err.message.should.eql('Save failed');
          done();
        });
      });
    });

    context('passing attributes as second argument', function() {
      it('sets them', function(done) {
        factory.create('job', { title: "Artist", company: "Bazqux Co." }, function(err, job) {
          (job instanceof Job).should.be.true;
          job.title.should.eql('Artist');
          job.company.should.eql('Bazqux Co.');
          job.saveCalled.should.be.true;
          done();
        });
      });
    });

  });

  describe('#buildMany', function() {
    it('builds a given set of objects', function (done) {
      var attrsArray = [{title: 'Scientist'}, {}];
      factory.buildMany('job', attrsArray, function (err, jobs) {
        if (err) return done(err);
        jobs.length.should.eql(2);
        var job = jobs[0];
        (job instanceof Job).should.be.true;
        job.title.should.eql('Scientist');
        job.should.not.have.property('saveCalled');
        jobs[1].title.should.eql('Engineer');
        done();
      });
    });
    it('builds more than the given set of objects', function (done) {
      var attrsArray = [{title: 'Scientist'}, {}];
      factory.buildMany('job', attrsArray, 10, function (err, jobs) {
        if (err) return done(err);
        jobs.length.should.eql(10);
        var job = jobs[0];
        (job instanceof Job).should.be.true;
        job.title.should.eql('Scientist');
        jobs[9].title.should.eql('Engineer');
        done();
      });
    });
    it('builds a number of objects', function (done) {
      factory.buildMany('job', 10, function (err, jobs) {
        if (err) return done(err);
        jobs.length.should.eql(10);
        var job = jobs[0];
        (job instanceof Job).should.be.true;
        jobs[9].title.should.eql('Engineer');
        done();
      });
    });
    it('builds a number of objects with the same attrs', function (done) {
      factory.buildMany('job', {title: 'Scientist'}, 10, function (err, jobs) {
        if (err) return done(err);
        jobs.length.should.eql(10);
        var job = jobs[0];
        (job instanceof Job).should.be.true;
        job.title.should.eql('Scientist');
        jobs[9].title.should.eql('Scientist');
        done();
      });
    });
  });

  describe('#createMany', function() {
    it('creates a given set of objects', function (done) {
      var attrsArray = [{title: 'Scientist'}, {}];
      factory.createMany('job', attrsArray, function (err, jobs) {
        if (err) return done(err);
        jobs.length.should.eql(2);
        var job = jobs[0];
        (job instanceof Job).should.be.true;
        job.title.should.eql('Scientist');
        job.saveCalled.should.be.true;
        jobs[1].title.should.eql('Engineer');
        jobs[1].saveCalled.should.be.true;
        done();
      });
    });
    it('creates more than the given set of objects', function (done) {
      var attrsArray = [{title: 'Scientist'}];
      factory.createMany('job', attrsArray, 10, function (err, jobs) {
        if (err) return done(err);
        jobs.length.should.eql(10);
        var job = jobs[0];
        (job instanceof Job).should.be.true;
        job.saveCalled.should.be.true;
        job.title.should.eql('Scientist');
        jobs[9].title.should.eql('Engineer');
        done();
      });
    });
    it('creates a number of objects', function (done) {
      factory.createMany('job', 10, function (err, jobs) {
        if (err) return done(err);
        jobs.length.should.eql(10);
        var job = jobs[0];
        (job instanceof Job).should.be.true;
        job.saveCalled.should.be.true;
        job.title.should.eql('Engineer');
        jobs[9].title.should.eql('Engineer');
        done();
      });
    });

    it("allows the creation of many objects", function(done) {
      factory.createMany('job', 1000, function (err, jobs) {
        if (err) return done(err);
        jobs.length.should.eql(1000);
        done();
      });
    });
  });

  describe('#cleanup', function() {
    it('removes created models', function(done) {
      factory.create('person', function(err, person) {
        factory.create('job', function(err, job) {
          factory.cleanup(function(err) {
            person.destroyCalled.should.be.true;
            person.job.destroyCalled.should.be.true;
            job.destroyCalled.should.be.true;
            done(err);            
          });
        });
      });
    });
  });

  describe('Factory class', function() {
    it('can be used to create new Factories', function() {
      var another = new factory.Factory();
      another.should.not.eql(factory);
      another.define('anotherModel', Job, {
        title: 'Scientist',
        company: 'Foobar Inc.'
      });
      another.build('anotherModel', function(err, job) {
        job.title.should.eql('Scientist');
      });
      factory.build('anotherModel', function(err) {
        should.exist(err);
      });
    });
  });

  describe('ObjectAdapter', function() {
    it('can be used to return raw objects', function() {
      var another = new factory.Factory();
      another.setAdapter(new factory.ObjectAdapter(), 'anotherModel');
      another.define('anotherModel', Job, {
        title: 'Scientist',
        company: 'Foobar Inc.'
      });
      another.build('anotherModel', function(err, job) {
        job.constructor.should.eql(Object);
      });
    });
  });

  describe('#buildSync', function() {
    var Post;
    beforeEach(function() {
      Post = function() {};
      Post.prototype = new Model();
      factory.define('post', Post, {
        heading: 'The Importance of Being Ernest',
        title: function() {
          return this.heading;
        }
      });
    });

    it('builds, but does not save the object', function() {
      var post = factory.buildSync('post');
      (post instanceof Post).should.be.true;
      post.heading.should.eql('The Importance of Being Ernest');
      post.should.not.have.property('saveCalled');
    });

    context('passing attributes as second argument', function() {
      it('sets them', function() {
        var post = factory.buildSync('post', { title: "Bazqux Co." });
        (post instanceof Post).should.be.true;
        post.heading.should.eql('The Importance of Being Ernest');
        post.title.should.eql('Bazqux Co.');
        post.should.not.have.property('saveCalled');
      });
    });

    it('allows synchronous function properties', function() {
      var post = factory.buildSync('post');
      (post instanceof Post).should.be.true;
      post.title.should.eql('The Importance of Being Ernest');
    });

    it('throws if the factory has async properties', function() {
      (function() {
        factory.buildSync('person');
      }).should.throw();
    });

  });

});

