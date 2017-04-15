import 'mocha';
import * as assert from 'assert';

import {
    tokenizeWithNewLines,
    flattenArray,
    preferSecond,
    scrubUrl
} from "./../src/funcs-misc";

import {
    nonStringSamples
} from "./_helper";


describe('funcs module', function () {

    describe('preferSecond()', function() {
        it('should return second element in an array, otherwise first', function() {
            assert.equal(preferSecond([1,3]), 3);
            assert.equal(preferSecond([5]), 5);
        });
    });

    describe('scrubUrl()', function() {
        it('should rremove undesired chars from url', function() {
            var act = scrubUrl("http://www><.yahoo'.com");
            assert.equal(act, "http://www.yahoo.com");
        });
    });
   
    describe('flattenArray()', function () {
        it('[] should equal to []', () => {
            var v = flattenArray([]);
            assert.deepEqual(v, []);
        });

        it('[2] should equal to [2]', () => {
            var v = flattenArray([2]);
            assert.deepEqual(v, [2]);
        });

        it('[2, [3]] should equal to [2, 3]', () => {
            var v = flattenArray([2, [3]]);
            assert.deepEqual(v, [2, 3]);
        });
    });

    describe('tokenizeWithNewLines()', function () {
        describe('when given a non-string arg', function () {
            it("should return it as an array ", () => {
                nonStringSamples.forEach((v) => {
                    var act = tokenizeWithNewLines(v);
                    assert.deepEqual(act, [v]);
                });
            });
        });

        describe('when given a string ', function () {
            it("should split and return an array of strings ", () => {
                var act = tokenizeWithNewLines("");
                assert.deepEqual(act, [""]);

                act = tokenizeWithNewLines("\n");
                assert.deepEqual(act, ["\n"]);
            
                act = tokenizeWithNewLines("abc");
                assert.deepEqual(act, ["abc"]);

                act = tokenizeWithNewLines("\n\n");
                assert.deepEqual(act, ["\n", "\n"]);

                act = tokenizeWithNewLines("\n \n");
                assert.deepEqual(act, ["\n", " ", "\n"]);
                
                act = tokenizeWithNewLines(" \nabc\n");
                assert.deepEqual(act, [" ", "\n", "abc", "\n"]);

                act = tokenizeWithNewLines("\n\nabc\n\n6\n");
                assert.deepEqual(act, ["\n", "\n", "abc", "\n", "\n", "6", "\n"]);
            });
        });
    });


});