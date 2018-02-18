
import 'mocha';
import * as assert from "assert";

import { InsertData, InsertDataQuill, InsertDataCustom } from './../src/InsertData';

describe('InsertData', function () {
   describe('InsertDataQuill', function () {
      describe('constructor()', function () {
         it('should instantiate', function () {
            var t = new InsertDataQuill("video", "https://");
            assert.equal(t.type === "video", true);
            assert.equal(t.value === "https://", true);

            t = new InsertDataQuill("text", "hello");
            assert.equal(t.type === "text", true);
            assert.equal(t.value === "hello", true);
         });
      });
   });

   describe('InsertDataCustom', function () {
      describe('constructor()', function () {
         it('should instantiate', function () {
            var t = new InsertDataCustom("biu", {});
            assert.equal(t.type === "biu", true);
            assert.deepEqual(t.value, {});
         });
      });
   });
});

