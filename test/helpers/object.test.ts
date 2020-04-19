import 'mocha';
import * as assert from 'assert';

import * as obj from './../../src/helpers/object';

describe('Object Helpers Module', function () {
  describe('assign()', function () {
    it('should copy properties from sources to target, later overriding earlier', function () {
      var s1 = { level: 1, name: 'Joe' };
      var s2 = { level: 2 };
      var o = obj.assign({}, s1, s2);
      assert.equal(o.level, 2);
      assert.equal(o.name, 'Joe');
      assert.ok(obj.assign(s1, null).level === 1);
      assert.throws(() => obj.assign(null, 2));
      (<any>Object.prototype).a = '';
      assert.ok(obj.assign({ x: 1 }, { x: 2 }).x === 2);
    });
  });
});
