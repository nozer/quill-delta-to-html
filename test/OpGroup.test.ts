
import 'mocha';
import * as assert from "assert";

import {OpGroup} from './../src/OpGroup';
import {DeltaInsertOp} from './../src/DeltaInsertOp';
import {Embed} from './../src/Embed';

describe('OpGroup', function() {

    describe('constructor()', function() {
        it('should instantiate', function() {
            var g = new OpGroup(null, [new DeltaInsertOp("d")]);
            assert.equal(g.op, null);
            assert.equal(g.ops[0].insert, "d");

            var g = new OpGroup(new DeltaInsertOp("d"));
            assert.equal(g.op instanceof DeltaInsertOp, true);
            assert.equal(g.ops, null);

            var g = new OpGroup(new DeltaInsertOp("d"), []);
            assert.equal(g.op instanceof DeltaInsertOp, true);
            assert.equal(g.ops.length, 0);
        });        
    });

    var denormalizedOps = [
        new DeltaInsertOp("aaa", {bold: true}),
        new DeltaInsertOp("\n"),
        new DeltaInsertOp("in a"),
        new DeltaInsertOp("block"),
        new DeltaInsertOp("\n", {blockquote: true}),
        new DeltaInsertOp(new Embed("video", "http://")),
        new DeltaInsertOp("\n")
    ];

    describe('#getOpsUntilNewLineOrBlockOp()', function() {
        it('should return ops until newline block or new op is encountered', function() {
            var act = OpGroup.getOpsUntilNewLineOrBlockOp(4, denormalizedOps);
            
            assert.deepEqual(act.ops, [
                denormalizedOps[2], denormalizedOps[3]
            ]);
        });
    });

    describe('#groupDenormalizedOps()', function() {
        it('should return ops grouped by group type', function() {
            var act = OpGroup.groupDenormalizedOps(denormalizedOps);
            var exp = [
                {
                    op: null,
                    ops: [
                        denormalizedOps[0], denormalizedOps[1]
                    ]
                },
                {
                    op: denormalizedOps[4],
                    ops: [
                        denormalizedOps[2], denormalizedOps[3]
                    ]
                },
                {
                    op: denormalizedOps[5],
                    ops: null
                },
                {
                    op: null,
                    ops: [ denormalizedOps[6]]
                },
            ];

            assert.deepEqual(act, exp);
        });
    });
});


