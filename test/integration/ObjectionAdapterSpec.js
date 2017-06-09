import '../test-helper/testUtils';
import ObjectionAdapter from '../../src/adapters/ObjectionAdapter';
import { Model } from 'objection';
import _knex from 'knex';
import { expect } from 'chai';

const knex = _knex({
  client: 'sqlite3',
  connection: {
    filename: ':memory:',
  },
  useNullAsDefault: true,
});

// bind the knex instance to Objection
Model.knex(knex);

// define the Kitten model
class Kitten extends Model {
  static get tableName() {
    return 'kitten';
  }
}

describe('ObjectionAdapterIntegration', function () {
  const adapter = new ObjectionAdapter;

  before(function (done) {
    knex.schema.createTable('kitten', table => {
      table.increments();
      table.string('name');
    }).then(() => done());
  });

  it('builds models and access attributes correctly', function (done) {
    const kitten = adapter.build(Kitten, { name: 'fluffy' });
    expect(kitten).to.be.instanceof(Kitten);
    let name = adapter.get(kitten, 'name', Kitten);
    expect(name).to.be.equal('fluffy');

    adapter.set({ name: 'fluffy2' }, kitten, Kitten);
    name = adapter.get(kitten, 'name', Kitten);

    expect(name).to.be.equal('fluffy2');

    done();
  });

  it('saves models correctly', function (done) {
    const kitten = adapter.build(Kitten, { name: 'fluffy' });
    adapter.save(kitten, Kitten)
      .then(k => {
        expect(k).to.have.property('id');
        return k;
      })
      .then(k => Kitten.query().deleteById(k.id))
      .then(() => done())
      .catch(err => done(err))
    ;
  });

  it('destroys models correctly', function (done) {
    const kitten = adapter.build(Kitten, { name: 'smellyCat' });
    adapter.save(kitten, Kitten)
      .then(() => Kitten.query().count('id as num').first())
      .then(count => expect(count.num).to.be.equal(1))
      .then(() => adapter.destroy(kitten, Kitten))
      .then(() => Kitten.query().count('id as num').first())
      .then(count => expect(count.num).to.be.equal(0))
      .then(() => done())
      .catch(err => done(err))
    ;
  });
});
