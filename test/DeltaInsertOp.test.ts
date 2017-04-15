
import 'mocha';
import * as assert from "assert";

import {Embed, EmbedType} from './../src/Embed';
import {DeltaInsertOp} from './../src/DeltaInsertOp';

describe('DeltaInsertOp', function() {

    describe('constructor()', function() {
        it('should instantiate', function() {
            var embed = new Embed(EmbedType.Image, "https://");
            var t = new DeltaInsertOp(embed);
            assert.equal(t instanceof DeltaInsertOp, true);
            assert.equal(t.insert instanceof Embed, true);
            assert.equal(t.attributes instanceof Object, true);

            t = new DeltaInsertOp("test");
            assert.deepEqual(typeof t.insert, 'string');

            t = new DeltaInsertOp(new Embed(EmbedType.Formula, "x=data"));
            assert.equal((<Embed>t.insert).value, "x=data");
        });
    });

    describe('isContainerBlock()', function() {
        it('should successfully check if the op is a block container', function() {
            var op = new DeltaInsertOp("test");
            assert.equal(op.isContainerBlock(), false);

            op = new DeltaInsertOp("test", {blockquote: true});
            assert.equal(op.isContainerBlock(), true);
        });
    });

    describe('isDataBlock()', function() {
        it('should successfully check if the op is a data block', function() {
            var op = new DeltaInsertOp("test", {header: 1});
            assert.equal(op.isDataBlock(), false);

            op = new DeltaInsertOp(new Embed(EmbedType.Video,"http://"));
            assert.equal(op.isDataBlock(), true);
        });
    });

    describe('isNewLine()', function() {
        it('should return true if op text is just newline character', function() {
            var op = new DeltaInsertOp("\n");
            assert.equal(op.isNewLine(), true);

            op = new DeltaInsertOp("\n ");
            assert.equal(op.isNewLine(), false);
        });
    });

    describe('isList()', function() {
        it('should return true if op is a list', function() {
            var op = new DeltaInsertOp("\n", {});
            assert.equal(op.isList(), false);

            op = new DeltaInsertOp("fds ", {list: "ordered"});
            assert.equal(op.isList(), true);
        });
    });

    describe('isBulletList()', function() {
        it('should return true if op is a bullet list', function() {
            var op = new DeltaInsertOp("\n", {list: 'bullet'});
            assert.equal(op.isBulletList(), true);

            op = new DeltaInsertOp("fds ", {list: "ordered"});
            assert.equal(op.isBulletList(), false);
        });
    });

    describe('isOrderedList()', function() {
        it('should return true if op is an ordered list', function() {
            var op = new DeltaInsertOp("\n", {list: 'bullet'});
            assert.equal(op.isOrderedList(), false);

            op = new DeltaInsertOp("fds ", {list: "ordered"});
            assert.equal(op.isOrderedList(), true);
        });
    });

    describe('isSameListAs()', function() {
        it('should return true if op list type same as the comparison', function() {
            var op = new DeltaInsertOp("\n", {list: 'bullet'});
            var op2 = new DeltaInsertOp("ds", {list: 'bullet'});
            assert.equal(op.isSameListAs(op2), true);

            var op3 = new DeltaInsertOp("fds ", {list: "ordered"});
            assert.equal(op.isSameListAs(op3), false);
        });
    });

    describe('isEmbed()/isText()', function() {
        it('should correctly identify insert type', function() {
            var op = new DeltaInsertOp("\n", {list: 'bullet'});
            assert.equal(op.isEmbed(), false);
            assert.equal(op.isText(), true);

            op = new DeltaInsertOp(new Embed("image", "d"), {list: "ordered"});
            assert.equal(op.isEmbed(), true);
            assert.equal(op.isText(), false);
        });
    });

    describe('isVideo()/isImage()/isFormula()', function() {
        it('should correctly identify embed type', function() {
            var op = new DeltaInsertOp(new Embed("video", ""));
            assert.equal(op.isVideo(), true);
            assert.equal(op.isFormula(), false);
            assert.equal(op.isImage(), false);

            op = new DeltaInsertOp(new Embed("image", "d"));
            assert.equal(op.isImage(), true);
            assert.equal(op.isFormula(), false);

            op = new DeltaInsertOp(new Embed("formula", "d"));
            assert.equal(op.isVideo(), false);
            assert.equal(op.isFormula(), true);
        });
    });

    describe('isLink()', function() {
        it('should correctly identify if op is a link', function() {
            var op = new DeltaInsertOp(new Embed("video", ""), {link: 'http://'});
            assert.equal(op.isLink(), false);
            

            op = new DeltaInsertOp("http", {link: 'http://'});
            assert.equal(op.isLink(), true);
        });
    });
});

