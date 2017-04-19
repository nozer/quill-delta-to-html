
import 'mocha';
import * as assert from "assert";

import {OpGroup} from './../src/OpGroup';
import {DeltaInsertOp} from './../src/DeltaInsertOp';
import {InsertData} from './../src/InsertData';

describe('OpGroup', function() {

    describe('constructor()', function() {
        it('should instantiate', function() {
            var g = new OpGroup(null, [new DeltaInsertOp("d")]);
            assert.equal(g.op, null);
            assert.equal(g.ops[0].insert.value, "d");

            var g = new OpGroup(new DeltaInsertOp("d"));
            assert.equal(g.op instanceof DeltaInsertOp, true);
            assert.equal(g.ops, null);

            var g = new OpGroup(new DeltaInsertOp("d"), []);
            assert.equal(g.op instanceof DeltaInsertOp, true);
            assert.equal((<DeltaInsertOp[]>g.ops).length, 0);
        });        
    });

    describe('#pairOpsWithTheirBlock()', function() {
        var ops  = [
            new DeltaInsertOp("aaa", {bold: true}),
            new DeltaInsertOp("\n"),
            new DeltaInsertOp("in a"),
            new DeltaInsertOp("block"),
            new DeltaInsertOp("\n", {blockquote: true}),
            new DeltaInsertOp(new InsertData("video", "http://")),
            new DeltaInsertOp("\n"),
            new DeltaInsertOp("\n", {indent: 1}),
            new DeltaInsertOp("hello"),
            new DeltaInsertOp("\n"),
            new DeltaInsertOp("\n", {list: 'bullet'}),
            new DeltaInsertOp("how are you?"),
            new DeltaInsertOp("\n", {blockquote: true})
        ];
        it('should return ops grouped by group type', function() {
            var act = OpGroup.pairOpsWithTheirBlock(ops);
            var exp = [
                {
                    op: null,
                    ops: [
                        ops[0], ops[1]
                    ]
                },
                {
                    op: ops[4],
                    ops: [
                        ops[2], ops[3]
                    ]
                },
                {
                    op: ops[5], ops: null
                },
                {
                    op: null, ops: [ ops[6]]
                },
                {
                    op: ops[7], ops: []
                },
                {
                    op: null, ops: [ops[8], ops[9]]
                },
                {
                    op: ops[10], ops: []
                },
                
                {
                    op: ops[12], ops: [ops[11]]
                }
            ];
            
            //console.log(ops);
            //console.log(JSON.stringify(act));
            assert.deepEqual(act, exp);
        });
    });

    describe('#pairOpsWithTheirBlock()', function() {
        it('should return ops grouped by group type', function() {
            var ops2 = [
                new DeltaInsertOp("this is text"),
                new DeltaInsertOp("\n"),
                new DeltaInsertOp("this is code"),
                new DeltaInsertOp("\n", {'code-block': true}),
                new DeltaInsertOp("this is code TOO!"),
                new DeltaInsertOp("\n", {'code-block': true})
            ];
            var pairs = OpGroup.pairOpsWithTheirBlock(ops2);
            assert.equal(pairs[1].ops.length , 1);
        });
    });

    describe('#groupConsecutiveSameStyleBlocks()', function() {
        it('should compine OpGroup of blocks with same type and style into an []', function() {
            var ops = [
                new DeltaInsertOp("this is code"),
                new DeltaInsertOp("\n", {'code-block': true}),
                new DeltaInsertOp("this is code TOO!"),
                new DeltaInsertOp("\n", {'code-block': true}),
                new DeltaInsertOp("\n", {blockquote: true}),
                new DeltaInsertOp("\n", {blockquote: true}),
                new DeltaInsertOp("\n"),
                new DeltaInsertOp("\n", {header: 1}),
                new DeltaInsertOp("\n", {header: 1}),
            ];
            var pairs = OpGroup.pairOpsWithTheirBlock(ops);
            var groups = OpGroup.groupConsecutiveSameStyleBlocks(pairs, {
                header: true,
                codeBlocks: true,
                blockquotes: true
            });
            assert.deepEqual(groups, [
                [new OpGroup(ops[1], [ops[0]]), new OpGroup(ops[3], [ops[2]])],
                [new OpGroup(ops[4], []), new OpGroup(ops[5], [])],
                new OpGroup(null, [ops[6]]),
                [new OpGroup(ops[7], []), new OpGroup(ops[8], [])] 
            ]);
        });
    });
    describe('#groupOpsOfSameStyleConsecutiveBlocksTogether()', function() {
        it('should return ops of all groups moved to 1st group', function() {
            var ops = [
                new DeltaInsertOp("this is code"),
                new DeltaInsertOp("\n", {'code-block': true}),
                new DeltaInsertOp("this is code TOO!"),
                new DeltaInsertOp("\n", {'code-block': true}),
                new DeltaInsertOp("\n", {blockquote: true}),
                new DeltaInsertOp("\n", {blockquote: true}),
                new DeltaInsertOp("\n"),
                new DeltaInsertOp("\n", {header: 1}),
            ];
            var pairs = OpGroup.pairOpsWithTheirBlock(ops);
            var groups = OpGroup.groupConsecutiveSameStyleBlocks(pairs)
            
            var act = OpGroup.reduceConsecutiveSameStyleBlocksToOne(groups);
            //console.log(JSON.stringify(act));
            assert.deepEqual(act , [
                new OpGroup(ops[3], [ops[0],ops[6], ops[2]]),
                new OpGroup(ops[5], [ops[6], ops[6]]),
                new OpGroup(null, [ops[6]]),
                new OpGroup(ops[7], [])
            ]);
        });
    });
});


