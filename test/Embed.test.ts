
import 'mocha';
import * as assert from "assert";

import {Embed, EmbedType} from './../src/Embed';

describe('Embed', function() {

    describe('constructor()', function() {
        it('should instantiate', function() {
            var t = new Embed(EmbedType.Video, "https://");
            assert.equal(t.type === EmbedType.Video, true);
            assert.equal(t.value === "https://", true);
        });
    });
});

