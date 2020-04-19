import 'mocha';
import * as assert from 'assert';

import { InsertDataQuill } from './../src/InsertData';
import { DeltaInsertOp } from './../src/DeltaInsertOp';
import { DataType, AlignType, ListType } from './../src/value-types';

describe('DeltaInsertOp', function () {
  describe('constructor()', function () {
    it('should instantiate', function () {
      var embed = new InsertDataQuill(DataType.Image, 'https://');
      var t = new DeltaInsertOp(embed);
      assert.equal(t instanceof DeltaInsertOp, true);
      assert.equal(t.insert instanceof InsertDataQuill, true);
      assert.equal(t.attributes instanceof Object, true);

      t = new DeltaInsertOp('test');
      assert.deepEqual(t.insert.value, 'test');

      t = new DeltaInsertOp(new InsertDataQuill(DataType.Formula, 'x=data'));
      assert.equal(t.insert.value, 'x=data');
    });
  });

  describe('isContainerBlock()', function () {
    it('should successfully check if the op is a block container', function () {
      var op = new DeltaInsertOp('test');
      assert.equal(op.isContainerBlock(), false);

      op = new DeltaInsertOp('test', { blockquote: true });
      assert.equal(op.isContainerBlock(), true);
    });
  });

  describe('hasSameAdiAs()', function () {
    it('should successfully if two ops have same align indent and direction', function () {
      var op1 = new DeltaInsertOp('\n', { align: AlignType.Right, indent: 2 });
      var op2 = new DeltaInsertOp('\n', { align: AlignType.Right, indent: 2 });

      assert.ok(op1.hasSameAdiAs(op2));

      var op2 = new DeltaInsertOp('\n', { align: AlignType.Right, indent: 3 });
      assert.ok(!op1.hasSameAdiAs(op2));
    });
  });

  describe('hasHigherIndentThan()', function () {
    it('should successfully if two ops have same align indent and direction', function () {
      var op1 = new DeltaInsertOp('\n', { indent: undefined });
      var op2 = new DeltaInsertOp('\n', { indent: undefined });

      assert.ok(!op1.hasHigherIndentThan(op2));
    });
  });

  describe('isInline()', function () {
    it('should return true if op is an inline', function () {
      var op = new DeltaInsertOp('\n', {});
      assert.equal(op.isInline(), true);
    });
  });

  describe('isJustNewline()', function () {
    it('should return true if op is a list', function () {
      var op = new DeltaInsertOp('\n', {});
      assert.equal(op.isJustNewline(), true);

      op = new DeltaInsertOp('\n\n ', { list: ListType.Ordered });
      assert.equal(op.isJustNewline(), false);
    });
  });

  describe('isList()', function () {
    it('should return true if op is a list', function () {
      var op = new DeltaInsertOp('\n', {});
      assert.equal(op.isList(), false);

      op = new DeltaInsertOp('fds ', { list: ListType.Ordered });
      assert.equal(op.isList(), true);

      op = new DeltaInsertOp('fds ', { list: ListType.Unchecked });
      assert.equal(op.isList(), true);
    });
  });

  describe('isBulletList()', function () {
    it('should return true if op is a bullet list', function () {
      var op = new DeltaInsertOp('\n', { list: ListType.Bullet });
      assert.equal(op.isBulletList(), true);

      op = new DeltaInsertOp('fds ', { list: ListType.Ordered });
      assert.equal(op.isBulletList(), false);
    });
  });

  describe('isOrderedList()', function () {
    it('should return true if op is an ordered list', function () {
      var op = new DeltaInsertOp('\n', { list: ListType.Bullet });
      assert.equal(op.isOrderedList(), false);

      op = new DeltaInsertOp('fds ', { list: ListType.Ordered });
      assert.equal(op.isOrderedList(), true);
    });
  });

  describe('isCheckedList()', function () {
    it('should return true if op is an checked list', function () {
      var op = new DeltaInsertOp('\n', { list: ListType.Unchecked });
      assert.equal(op.isCheckedList(), false);

      op = new DeltaInsertOp('fds ', { list: ListType.Checked });
      assert.equal(op.isCheckedList(), true);
    });
  });

  describe('isUncheckedList()', function () {
    it('should return true if op is an unchecked list', function () {
      var op = new DeltaInsertOp('\n', { list: ListType.Bullet });
      assert.equal(op.isUncheckedList(), false);

      op = new DeltaInsertOp('fds ', { list: ListType.Unchecked });
      assert.equal(op.isUncheckedList(), true);
    });
  });

  describe('isSameListAs()', function () {
    it('should return true if op list type same as the comparison', function () {
      var op = new DeltaInsertOp('\n', { list: ListType.Bullet });
      var op2 = new DeltaInsertOp('ds', { list: ListType.Bullet });
      assert.equal(op.isSameListAs(op2), true);

      var op3 = new DeltaInsertOp('fds ', { list: ListType.Ordered });
      assert.equal(op.isSameListAs(op3), false);
    });
  });

  describe('isText()', function () {
    it('should correctly identify insert type', function () {
      var op = new DeltaInsertOp('\n', { list: ListType.Bullet });
      assert.equal(op.isVideo(), false);
      assert.equal(op.isText(), true);

      op = new DeltaInsertOp(new InsertDataQuill(DataType.Image, 'd'), {
        list: ListType.Ordered,
      });
      assert.equal(op.isImage(), true);
      assert.equal(op.isText(), false);
    });
  });

  describe('isVideo()/isImage()/isFormula()', function () {
    it('should correctly identify embed type', function () {
      var op = new DeltaInsertOp(new InsertDataQuill(DataType.Video, ''));
      assert.equal(op.isVideo(), true);
      assert.equal(op.isFormula(), false);
      assert.equal(op.isImage(), false);

      op = new DeltaInsertOp(new InsertDataQuill(DataType.Image, 'd'));
      assert.equal(op.isImage(), true);
      assert.equal(op.isFormula(), false);

      op = new DeltaInsertOp(new InsertDataQuill(DataType.Formula, 'd'));
      assert.equal(op.isVideo(), false);
      assert.equal(op.isFormula(), true);
    });
  });

  describe('isLink()', function () {
    it('should correctly identify if op is a link', function () {
      var op = new DeltaInsertOp(new InsertDataQuill(DataType.Video, ''), {
        link: 'http://',
      });
      assert.equal(op.isLink(), false);

      op = new DeltaInsertOp('http', { link: 'http://' });
      assert.equal(op.isLink(), true);
    });
  });
});
