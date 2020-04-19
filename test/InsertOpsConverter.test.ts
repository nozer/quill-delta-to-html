import 'mocha';
import * as assert from 'assert';

import { DeltaInsertOp } from './../src/DeltaInsertOp';
import { InsertDataQuill } from './../src/InsertData';
import { InsertOpsConverter } from './../src/InsertOpsConverter';

var data = [
  {
    ops: [
      { insert: 'This ' },
      { attributes: { font: 'monospace' }, insert: 'is' },
      { insert: ' a ' },
      { attributes: { size: 'large' }, insert: 'test' },
      { insert: ' ' },
      { attributes: { italic: true, bold: true }, insert: 'data' },
      { insert: ' ' },
      { attributes: { underline: true, strike: true }, insert: 'that' },
      { insert: ' is ' },
      { attributes: { color: '#e60000' }, insert: 'will' },
      { insert: ' ' },
      { attributes: { background: '#ffebcc' }, insert: 'test' },
      { insert: ' ' },
      { attributes: { script: 'sub' }, insert: 'the' },
      { insert: ' ' },
      { attributes: { script: 'super' }, insert: 'rendering' },
      { insert: ' of ' },
      { attributes: { link: 'yahoo' }, insert: 'inline' },
      { insert: ' ' },
      { insert: { formula: 'x=data' } },
      { insert: '  formats.\n' },
    ],
    html: [
      '<p>',
      'This ',
      '<span class="noz-font-monospace">is</span>',
      ' a ',
      '<span class="noz-size-large">test</span>',
      ' ',
      '<strong><em>data</em></strong>',
      ' ',
      '<s><u>that</u></s>',
      ' is ',
      '<span style="color:#e60000">will</span>',
      ' ',
      '<span style="background-color:#ffebcc">test</span>',
      ' ',
      '<sub>the</sub>',
      ' ',
      '<sup>rendering</sup>',
      ' of ',
      '<a href="yahoo">inline</a>',
      ' ',
      '<span class="noz-formula">x=data</span>',
      ' formats.<br />',
    ].join(''),
  },
];

describe('InsertOpsConverter', function () {
  describe('#convert()', function () {
    it('should transform raw delta ops to DeltaInsertOp[]', function () {
      var objs = InsertOpsConverter.convert(data[0].ops, {});

      assert.equal(objs[0] instanceof DeltaInsertOp, true);
      assert.equal(objs[objs.length - 1] instanceof DeltaInsertOp, true);
      assert.deepEqual(InsertOpsConverter.convert(null, {}), []);
      assert.deepEqual(InsertOpsConverter.convert([{ insert: '' }], {}), []);
      assert.deepEqual(
        InsertOpsConverter.convert([{ insert: { cake: '' } }], {}),
        [{ insert: { type: 'cake', value: '' }, attributes: {} }]
      );
      assert.deepEqual(InsertOpsConverter.convert([{ insert: 2 }], {}), []);
      //console.log(objs);
    });
  });

  describe('#convertInsertVal()', function () {
    it('should convert raw .insert value to valid TInsert or null', function () {
      [null, undefined, 3, {}].forEach((v) => {
        var act = InsertOpsConverter.convertInsertVal(v, {});
        assert.equal(act, null);
      });

      ['fdsf', { image: 'ff' }, { video: '' }, { formula: '' }].forEach((v) => {
        var act = InsertOpsConverter.convertInsertVal(v, {});
        assert.notEqual(act, null);
        assert.ok(act instanceof InsertDataQuill);
      });
    });
  });
});
