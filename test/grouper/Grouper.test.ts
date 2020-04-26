import 'mocha';
import * as assert from 'assert';

import { Grouper } from './../../src/grouper/Grouper';
import { DeltaInsertOp } from './../../src/DeltaInsertOp';
import { InsertDataQuill } from './../../src/InsertData';
import {
  VideoItem,
  InlineGroup,
  BlockGroup,
} from './../../src/grouper/group-types';
import { DataType } from './../../src/value-types';
describe('Grouper', function () {
  describe('#pairOpsWithTheirBlock()', function () {
    var ops = [
      new DeltaInsertOp(new InsertDataQuill(DataType.Video, 'http://')),
      new DeltaInsertOp('hello'),
      new DeltaInsertOp('\n'),
      new DeltaInsertOp('how are you?'),
      new DeltaInsertOp('\n'),
      new DeltaInsertOp('Time is money'),
      new DeltaInsertOp('\n', { blockquote: true }),
    ];
    it('should return ops grouped by group type', function () {
      var act = Grouper.pairOpsWithTheirBlock(ops);
      var exp = [
        new VideoItem(ops[0]),
        new InlineGroup([ops[1], ops[2], ops[3], ops[4]]),
        new BlockGroup(ops[6], [ops[5]]),
      ];
      assert.deepEqual(act, exp);
    });
  });

  describe('#groupConsecutiveSameStyleBlocks()', function () {
    it('should compine blocks with same type and style into an []', function () {
      var ops = [
        new DeltaInsertOp('this is code'),
        new DeltaInsertOp('\n', { 'code-block': true }),
        new DeltaInsertOp('this is code TOO!'),
        new DeltaInsertOp('\n', { 'code-block': true }),
        new DeltaInsertOp('\n', { blockquote: true }),
        new DeltaInsertOp('\n', { blockquote: true }),
        new DeltaInsertOp('\n'),
        new DeltaInsertOp('\n', { header: 1 }),
        new DeltaInsertOp('\n', { header: 1 }),
        new DeltaInsertOp('\n', { attr1: true, renderAsBlock: true }),
        new DeltaInsertOp('\n', { attr1: true, renderAsBlock: true }),
        new DeltaInsertOp('\n', { attr1: 'test', renderAsBlock: true }),
        new DeltaInsertOp('\n', { attr2: 'test', renderAsBlock: true }),
      ];
      var pairs = Grouper.pairOpsWithTheirBlock(ops);
      var groups = Grouper.groupConsecutiveSameStyleBlocks(pairs, {
        header: true,
        codeBlocks: true,
        blockquotes: true,
        customBlocks: true,
      });
      assert.deepEqual(groups, [
        [new BlockGroup(ops[1], [ops[0]]), new BlockGroup(ops[1], [ops[2]])],
        [new BlockGroup(ops[4], []), new BlockGroup(ops[4], [])],
        new InlineGroup([ops[6]]),
        [new BlockGroup(ops[7], []), new BlockGroup(ops[8], [])],
        [new BlockGroup(ops[9], []), new BlockGroup(ops[10], [])],
        new BlockGroup(ops[11], []),
        new BlockGroup(ops[12], []),
      ]);
    });
  });
  describe('#reduceConsecutiveSameStyleBlocksToOne()', function () {
    it('should return ops of combined groups moved to 1st group', function () {
      var ops = [
        new DeltaInsertOp('this is code'),
        new DeltaInsertOp('\n', { 'code-block': true }),
        new DeltaInsertOp('this is code TOO!'),
        new DeltaInsertOp('\n', { 'code-block': true }),
        new DeltaInsertOp('\n', { blockquote: true }),
        new DeltaInsertOp('\n', { blockquote: true }),
        new DeltaInsertOp('\n'),
        new DeltaInsertOp('\n', { header: 1 }),
      ];
      var pairs = Grouper.pairOpsWithTheirBlock(ops);
      var groups = Grouper.groupConsecutiveSameStyleBlocks(pairs);
      //console.log(groups);
      var act = Grouper.reduceConsecutiveSameStyleBlocksToOne(groups);
      //console.log(act);
      //console.log(JSON.stringify(act));
      assert.deepEqual(act, [
        new BlockGroup(ops[1], [ops[0], ops[6], ops[2]]),
        new BlockGroup(ops[4], [ops[6], ops[6]]),
        new InlineGroup([ops[6]]),
        new BlockGroup(ops[7], [ops[6]]),
      ]);
    });
  });
});
