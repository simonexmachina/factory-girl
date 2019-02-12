import { expect } from 'chai';
import Factory, { ObjectAdapter } from '../../src';
import '../test-helper/dummyFactories';
import asyncFunction from '../test-helper/asyncFunction';

describe('indexIntegration', function () {
  Factory.setAdapter(new ObjectAdapter);
  beforeEach(function () {
    Factory.cleanUp();
  });

  describe('PhoneNumber factory', function () {
    it('can get attrs', asyncFunction(async function () {
      const attrs = await Factory.attrs('PhoneNumber');
      expect(attrs).to.be.eql({
        type: 'mobile',
        number: '1234567890',
      });
    }));

    it('can override attrs', asyncFunction(async function () {
      const attrs = await Factory.attrs('PhoneNumber', { number: '0987654321' });
      expect(attrs).to.be.eql({
        type: 'mobile',
        number: '0987654321',
      });
    }));

    it('can override attrs with generators as well',
      asyncFunction(async function () {
        const attrs = await Factory.attrs(
          'PhoneNumber', {
            alternate: Factory.assocAttrs('PhoneNumber'),
          }
        );
        expect(attrs.alternate).to.be.eql({
          type: 'mobile',
          number: '1234567890',
        });
      })
    );

    it('can get multiple attrs', asyncFunction(async function () {
      const attrs = await Factory.attrsMany(
        'PhoneNumber', 3, {
          number: Factory.seq('PhoneNumber.override', n => `123-${n}`),
        }
      );
      expect(attrs).to.be.an('array');
      expect(attrs).to.have.lengthOf(3);
    }));

    it('can use chance generator', asyncFunction(async function () {
      const attrs = await Factory.attrs('User');
      expect(attrs.bio).to.exist;
    }));
  });

  describe('sequences', function () {
    it('generates sequences correctly', asyncFunction(async function () {
      const objSeq1 = await Factory.build('ObjSeq');
      const objSeq2 = await Factory.build('ObjSeq');
      const funcSeq1 = await Factory.build('FuncSeq', {}, { prefix: 'seq' });
      const funcSeq2 = await Factory.build('FuncSeq', {}, { prefix: 'seq' });

      expect(objSeq1.s1).to.be.equal(1);
      expect(objSeq1.s2).to.be.equal(1);
      expect(objSeq1.s3).to.be.equal('seq-1');
      expect(funcSeq1.s1).to.be.equal(1);
      expect(funcSeq1.s2).to.be.equal(1);
      expect(funcSeq1.s3).to.be.equal('seq-1');

      expect(objSeq2.s1).to.be.equal(2);
      expect(objSeq2.s2).to.be.equal(2);
      expect(objSeq2.s3).to.be.equal('seq-2');
      expect(funcSeq2.s1).to.be.equal(2);
      expect(funcSeq2.s2).to.be.equal(2);
      expect(funcSeq2.s3).to.be.equal('seq-2');
    }));
  });
});
