import 'mocha';
import * as assert from 'assert';

import { sanitize } from './../../src/helpers/url';

describe('Url Helpers Module', function () {
  describe('String#_sanitizeUrl() ', function () {
    it('should add unsafe: for invalid protocols', function () {
      var act = "http://www><.yahoo'.com";
      assert.equal(sanitize(act), "http://www><.yahoo'.com");

      act = 'https://abc';
      assert.equal(sanitize(act), 'https://abc');

      act = 'sftp://abc';
      assert.equal(sanitize(act), 'sftp://abc');

      act = ' ftp://abc';
      assert.equal(sanitize(act), 'ftp://abc');

      act = '  file://abc';
      assert.equal(sanitize(act), 'file://abc');

      act = '   blob://abc';
      assert.equal(sanitize(act), 'blob://abc');

      act = 'mailto://abc';
      assert.equal(sanitize(act), 'mailto://abc');

      act = 'tel://abc';
      assert.equal(sanitize(act), 'tel://abc');

      act = '#abc';
      assert.equal(sanitize(act), '#abc');

      act = '/abc';
      assert.equal(sanitize(act), '/abc');

      act = ' data:image//abc';
      assert.equal(sanitize(act), 'data:image//abc');

      act = "javascript:alert('hi')";
      assert.equal(sanitize(act), "unsafe:javascript:alert('hi')");
    });
  });
});
