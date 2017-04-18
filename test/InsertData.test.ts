
import 'mocha';
import * as assert from "assert";

import { InsertData } from './../src/InsertData';

describe('InsertData', function () {

    describe('constructor()', function () {
        it('should instantiate', function () {
            var t = new InsertData("video", "https://");
            assert.equal(t.type === "video", true);
            assert.equal(t.value === "https://", true);

            t = new InsertData("text", "hello");
            assert.equal(t.type === "text", true);
            assert.equal(t.value === "hello", true);
        });
    });
});

