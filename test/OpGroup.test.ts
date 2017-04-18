
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

    describe('#groupOps()', function() {
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
            var act = OpGroup.groupOps(ops);
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

    describe('#groupOps()', function() {
        it('should return ops grouped by group type', function() {
            var ops2 = [
                new DeltaInsertOp("this is text"),
                new DeltaInsertOp("\n"),
                new DeltaInsertOp("this is code"),
                new DeltaInsertOp("\n", {'code-block': true}),
                new DeltaInsertOp("this is code TOO!"),
                new DeltaInsertOp("\n", {'code-block': true})
            ];
            var groups = OpGroup.groupOps(ops2);
            console.log(JSON.stringify(groups));
            assert.equal(groups[1].ops.length , 2);
        });
    });

    describe('#moveConsecutiveCodeblockOpsToFirstGroup()', function() {
        it('should return ops of all groups moved to 1st group', function() {
            var ops = [
                new DeltaInsertOp("this is code"),
                new DeltaInsertOp("\n", {'code-block': true}),
                new DeltaInsertOp("this is code TOO!"),
                new DeltaInsertOp("\n", {'code-block': true})
            ];
            var groups = [
                new OpGroup(ops[3], [ops[2]]),
                new OpGroup(ops[1], [ops[0]])
            ];

            var act = OpGroup.moveConsecutiveCodeblockOpsToFirstGroup(groups);

            assert.deepEqual(act , [
                new OpGroup(ops[3], [ ops[2], ops[0] ])
            ]);
        });
    });
});


