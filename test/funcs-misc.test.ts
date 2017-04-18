import 'mocha';
import * as assert from 'assert';

import {
    tokenizeWithNewLines,
    preferSecond,
    scrubUrl,
    assign,
    groupConsecutiveElementsWhile
} from "./../src/funcs-misc";

import { nonStringSamples } from "./data/nonStringSamples";


describe('funcs module', function () {

    describe('preferSecond()', function() {
        it('should return second element in an array, otherwise first', function() {
            assert.equal(preferSecond([1,3]), 3);
            assert.equal(preferSecond([5]), 5);
            assert.equal(preferSecond([]), null);

        });
    });

    describe('scrubUrl()', function() {
        it('should rremove undesired chars from url', function() {
            var act = scrubUrl("http://www><.yahoo'.com");
            assert.equal(act, "http://www.yahoo.com");
        });
    });
   
    describe('tokenizeWithNewLines()', function () {
        describe('when given a non-string arg', function () {
            it("should return it as an array ", () => {
                nonStringSamples.forEach((v) => {
                    var act = tokenizeWithNewLines(v);
                    assert.deepEqual(act, [v]);
                });

                assert.deepEqual(tokenizeWithNewLines("hello\nthere"), [
                    "hello","\n", 'there'
                ]);
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

    describe('assign(target, source, source2, ...)', function() {
        it('should copy properties from sources to target, later overriding earlier', function() {
            var s1 = {level: 1, name: 'Joe'};
            var s2 = {level: 2}
            var o = assign({}, s1, s2);
            assert.equal(o.level, 2);
            assert.equal(o.name , 'Joe');
            assert.ok(assign(s1, null).level === 1);
            assert.throws(() => assign(null, 2));
        });
    });

    describe('groupConsecutiveElementsWhile)', function() {
        it('should move consecutive elements matching predicate into an arr', function() {
            var arr = [1, "ha", 3, "ha", "ha"]; 
            var grp = groupConsecutiveElementsWhile(arr, (v) => typeof v === 'string');
            assert.deepEqual(grp, [1, ["ha"], 3, ["ha", "ha"]]);
        });
    });
});