import 'mocha';
import * as assert from 'assert';

import { InsertDataQuill, InsertDataCustom } from './../src/InsertData';
import { DataType } from './../src/value-types';

describe('InsertData', function () {
  describe('InsertDataQuill', function () {
    describe('constructor()', function () {
      it('should instantiate', function () {
        var t = new InsertDataQuill(DataType.Video, 'https://');
        assert.equal(t.type === 'video', true);
        assert.equal(t.value === 'https://', true);

        t = new InsertDataQuill(DataType.Text, 'hello');
        assert.equal(t.type === 'text', true);
        assert.equal(t.value === 'hello', true);
      });
    });
  });

  describe('InsertDataCustom', function () {
    describe('constructor()', function () {
      it('should instantiate', function () {
        var t = new InsertDataCustom('biu', {});
        assert.equal(t.type === 'biu', true);
        assert.deepEqual(t.value, {});
      });
    });
  });
});
