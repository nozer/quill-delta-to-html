import 'mocha';
import * as assert from 'assert';

import './../../src/extensions/Object';

describe("Object Extensions Module", function(){

    describe('Object#_assign()', function () {
        it('should copy properties from sources to target, later overriding earlier', function() {
            var s1 = {level: 1, name: 'Joe'};
            var s2 = {level: 2}
            var o = Object._assign({}, s1, s2);
            assert.equal(o.level, 2);
            assert.equal(o.name , 'Joe');
            assert.ok(Object._assign(s1, null).level === 1);
            assert.throws(() => Object._assign(null, 2));
            (<any>Object.prototype).a = "";
            assert.ok(Object._assign({x:1}, {x: 2}).x === 2);
            
        });
    });
});