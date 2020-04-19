import 'mocha';
import * as assert from 'assert';

import { tokenizeWithNewLines } from './../../src/helpers/string';

describe('String Extensions Module', function () {
  describe('String#_tokenizeWithNewLines()', function () {
    it('should split and return an array of strings ', () => {
      var act = '';
      assert.deepEqual(tokenizeWithNewLines(act), ['']);

      act = '\n';
      assert.deepEqual(tokenizeWithNewLines(act), ['\n']);

      act = 'abc';
      assert.deepEqual(tokenizeWithNewLines(act), ['abc']);

      act = 'abc\nd';
      assert.deepEqual(tokenizeWithNewLines(act), ['abc', '\n', 'd']);

      act = '\n\n';
      assert.deepEqual(tokenizeWithNewLines(act), ['\n', '\n']);

      act = '\n \n';
      assert.deepEqual(tokenizeWithNewLines(act), ['\n', ' ', '\n']);

      act = ' \nabc\n';
      assert.deepEqual(tokenizeWithNewLines(act), [' ', '\n', 'abc', '\n']);

      act = '\n\nabc\n\n6\n';
      assert.deepEqual(tokenizeWithNewLines(act), [
        '\n',
        '\n',
        'abc',
        '\n',
        '\n',
        '6',
        '\n',
      ]);
    });
  });
});
