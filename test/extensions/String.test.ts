
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

    describe('String#_scrubUrl()', function() {
        it('should rremove undesired chars from url', function() {
            var act = "http://www><.yahoo'.com"._scrubUrl();
            assert.equal(act, "http://www.yahoo.com");
        });
    });
});