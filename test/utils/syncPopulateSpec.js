import '../test-helper/testUtils';
import syncPopulate from '../../src/utils/syncPopulate';
import { expect } from 'chai';

describe('syncPopulate', function () {
  it("doesn't returns a promise", function () {
    const syncPopulateP = syncPopulate({}, {});
    expect(syncPopulateP.then).to.not.be.a('function');
  });

  it('throws error if target is not an object', function () {
    expect(() => syncPopulate(undefined, {})).to.throw();
  });

  it('throws error if source is not an object', function () {
    expect(() => syncPopulate({})).to.throw();
  });

  it('populates objects correctly', function () {
    function Foo() {}
    const source = {
      num: 1,
      nullValue: null,
      str: 'hello',
      date: new Date(),
      foo: new Foo(),
      funcs: {
        sync: () => 'shouldHaveThisValue',
        // async: async () => "shouldHaveResolvedValue",
        // promise: () => Promise.resolve("shouldWorkWithPromises")
      },
      arrays: {
        simple: [1, 2, 3],
        funcs: [() => 1, () => 2, () => 3],
        nested: [
          1,
          [{ a: 1, b: 2 }, { c: 3, d: 4 }, [{ p: () => 20, q: [6, 7] }]],
        ],
      },
    };

    const target = {};
    syncPopulate(target, source);

    expect(target).to.be.eql({
      num: 1,
      nullValue: null,
      str: 'hello',
      date: source.date,
      foo: source.foo,
      funcs: {
        sync: 'shouldHaveThisValue',
        // async: "shouldHaveResolvedValue",
        // promise: "shouldWorkWithPromises"
      },
      arrays: {
        simple: [1, 2, 3],
        funcs: [1, 2, 3],
        nested: [
          1,
          [
            { a: 1, b: 2 },
            { c: 3, d: 4 },
            [
              {
                p: 20,
                q: [6, 7],
              },
            ],
          ],
        ],
      },
    });
  });

  it('overrides only provided data', function () {
    const target = {
      x: {
        y: 1,
        z: 3,
      },
      p: [1, 2, 3],
    };
    const source = {
      x: {
        y: () => 'yo',
      },
      p: [4],
    };

    syncPopulate(target, source);

    expect(target).to.be.eql({
      x: {
        y: 'yo',
        z: 3,
      },
      p: [4],
    });
  });
});
