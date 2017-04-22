
import 'mocha';
import * as assert from 'assert';

import './../../src/extensions/Array';

describe("Array Extensions Module", function(){

    describe("Array#_preferSecond", function(){
        it('should return second element in an array, otherwise first or null', function() {
            assert.equal([1,3]._preferSecond(), 3);
            assert.equal([5]._preferSecond(), 5);
            assert.equal([]._preferSecond(), null);
        });
    });

    describe("Array#_flatten", function(){
        it('should return deeply flattened array', function() {
            assert.deepEqual([1,3, [4, [5, [6, 7]]]]._flatten(), [
                1,3,4,5,6,7
            ]);
            assert.deepEqual([]._flatten(), []);
        });
    });

    describe('Array#_groupConsecutiveElementsWhile)', function() {
        it('should move consecutive elements matching predicate into an arr', function() {
            var arr = [1, "ha", 3, "ha", "ha"]; 
            var grp = arr._groupConsecutiveElementsWhile((v, v2) => typeof v === typeof v2);
            assert.deepEqual(grp, [1, "ha", 3, ["ha", "ha"]]);

            arr = [1, 2,3, 10,11,12]; 
            var grp = arr._groupConsecutiveElementsWhile((v, v2) => v-1 === v2);
            assert.deepEqual(grp, [[1,2,3], [10,11,12]]);
        });
    });

    describe("Array#_intersperse", function(){
        it('should put specified element between arr elements', function() {
            assert.deepEqual([1,3, 4]._intersperse(0), [
                1,0,3,0, 4
            ]);
            assert.deepEqual([1]._intersperse(2), [1]);
        });
    });

});