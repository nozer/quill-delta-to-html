import 'mocha';
import * as assert from 'assert';

import { InsertOpDenormalizer } from './../src/InsertOpDenormalizer';

describe('InsertOpDenormalizer', function () {
  describe('#denormalize()', function () {
    it('should return denormalized op as array of ops', function () {
      var op = { insert: '\n' };
      var act = InsertOpDenormalizer.denormalize({ insert: '\n' });
      assert.deepEqual(act, [op]);

      op = { insert: 'abc' };
      act = InsertOpDenormalizer.denormalize(op);
      assert.deepEqual(act, [op]);

      var op2 = { insert: 'abc\n', attributes: { link: 'cold' } };
      act = InsertOpDenormalizer.denormalize(op2);
      assert.equal(act.length, 2);
      assert.equal(act[0].insert, 'abc');
      assert.equal(act[0].attributes.link, 'cold');

      var op3 = { insert: '\n\n', attributes: { bold: true } };
      act = InsertOpDenormalizer.denormalize(op3);
      assert.equal(act.length, 2);
      assert.equal(act[1].insert, '\n');

      act = InsertOpDenormalizer.denormalize(null);
      assert.deepEqual(act, []);
      act = InsertOpDenormalizer.denormalize('..');
      assert.deepEqual(act, []);
    });
  });
});
