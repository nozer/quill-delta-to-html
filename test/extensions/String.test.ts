
import 'mocha';
import * as assert from 'assert';

import './../../src/extensions/String';

describe("String Extensions Module", function(){

    describe('String#_tokenizeWithNewLines()', function () {
        it("should split and return an array of strings ", () => {
            var act = ""._tokenizeWithNewLines();
            assert.deepEqual(act, [""]);

            act = "\n"._tokenizeWithNewLines();
            assert.deepEqual(act, ["\n"]);
        
            act = "abc"._tokenizeWithNewLines();
            assert.deepEqual(act, ["abc"]);

            act = "abc\nd"._tokenizeWithNewLines();
            assert.deepEqual(act, ["abc", "\n", "d"]);

            act = "\n\n"._tokenizeWithNewLines();
            assert.deepEqual(act, ["\n", "\n"]);

            act = "\n \n"._tokenizeWithNewLines();
            assert.deepEqual(act, ["\n", " ", "\n"]);
            
            act = " \nabc\n"._tokenizeWithNewLines();
            assert.deepEqual(act, [" ", "\n", "abc", "\n"]);

            act = "\n\nabc\n\n6\n"._tokenizeWithNewLines();
            assert.deepEqual(act, ["\n", "\n", "abc", "\n", "\n", "6", "\n"]);
        });
    });

    describe('String#_sanitizeUrl() ', function() {
        it('should add unsafe: for invalid protocols', function() {
            var act = "http://www><.yahoo'.com"._sanitizeUrl();
            assert.equal(act, "http://www><.yahoo'.com");

            act = "https://abc"._sanitizeUrl();
            assert.equal(act, "https://abc");

            act = "sftp://abc"._sanitizeUrl();
            assert.equal(act, "sftp://abc");

            act = " ftp://abc"._sanitizeUrl();
            assert.equal(act, "ftp://abc");

            act = "  file://abc"._sanitizeUrl();
            assert.equal(act, "file://abc");

            act = "   blob://abc"._sanitizeUrl();
            assert.equal(act, "blob://abc");

            act = "mailto://abc"._sanitizeUrl();
            assert.equal(act, "mailto://abc");

            act = "tel://abc"._sanitizeUrl();
            assert.equal(act, "tel://abc");

            act = "#abc"._sanitizeUrl();
            assert.equal(act, "#abc");

            act = " data:image//abc"._sanitizeUrl();
            assert.equal(act, "data:image//abc");

            act = "javascript:alert('hi')"._sanitizeUrl();
            assert.equal(act, "unsafe:javascript:alert('hi')");

        });
    });
});