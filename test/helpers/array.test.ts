import 'mocha';
import * as assert from 'assert';

import {
  preferSecond,
  flatten,
  groupConsecutiveElementsWhile,
  intersperse,
  find,
} from './../../src/helpers/array';

describe('Array Helpers Module', function () {
  describe('preferSecond()', function () {
    it('should return second element in an array, otherwise first or null', function () {
      assert.equal(preferSecond([1, 3]), 3);
      assert.equal(preferSecond([5]), 5);
      assert.equal(preferSecond([]), null);
    });
  });

  describe('flatten()', function () {
    it('should return deeply flattened array', function () {
      assert.deepEqual(flatten([1, 3, [4, [5, [6, 7]]]]), [1, 3, 4, 5, 6, 7]);
      assert.deepEqual(flatten([]), []);
    });
  });

  describe('groupConsecutiveElementsWhile()', function () {
    it('should move consecutive elements matching predicate into an arr', function () {
      var arr = [1, 'ha', 3, 'ha', 'ha'];
      var grp = groupConsecutiveElementsWhile(
        arr,
        (v, v2) => typeof v === typeof v2
      );
      assert.deepEqual(grp, [1, 'ha', 3, ['ha', 'ha']]);

      arr = [1, 2, 3, 10, 11, 12];
      var grp = groupConsecutiveElementsWhile(arr, (v, v2) => v - 1 === v2);
      assert.deepEqual(grp, [
        [1, 2, 3],
        [10, 11, 12],
      ]);
    });
  });

  describe('intersperse()', function () {
    it('should put specified element between arr elements', function () {
      assert.deepEqual(intersperse([1, 3, 4], 0), [1, 0, 3, 0, 4]);
      assert.deepEqual(intersperse([1], 2), [1]);
    });
  });

  describe('find()', function () {
    it('should native find sepecific element', function () {
      assert.equal(
        find([1, 3], (elem) => elem === 3),
        3
      );
      assert.equal(
        find([], (elem) => elem === 3),
        null
      );
    });

    it('should polyfill find sepecific element', function () {
      Object.assign(Array.prototype, { find: undefined });

      assert.equal(
        find([1, 3], (elem) => elem === 3),
        3
      );
      assert.equal(
        find([], (elem) => elem === 3),
        null
      );
    });
  });
});
