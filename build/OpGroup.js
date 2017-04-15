"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
;
var OpGroup = (function () {
    function OpGroup(op, ops) {
        if (op === void 0) { op = null; }
        if (ops === void 0) { ops = null; }
        this.op = op;
        this.ops = ops;
    }
    OpGroup.getOpsUntilNewLineOrBlockOp = function (currentIndex, ops) {
        var result = {
            ops: [],
            lastIndex: currentIndex
        };
        for (var i = currentIndex - 1; i >= 0; i--) {
            var op = ops[i];
            if (op.isNewLine() || op.isDataBlock() || op.isContainerBlock()) {
                break;
            }
            result.lastIndex = i;
            result.ops.push(op);
        }
        result.ops.reverse();
        return result;
    };
    OpGroup.groupDenormalizedOps = function (ops) {
        var result = [];
        var inlines = [];
        var commitAndResetInlines = function () {
            if (!inlines.length) {
                return;
            }
            inlines.reverse();
            result.push(new OpGroup(null, inlines));
            inlines = [];
        };
        var lastInd = ops.length - 1;
        for (var i = lastInd; i >= 0; i--) {
            var op = ops[i];
            if (op.isContainerBlock()) {
                commitAndResetInlines();
                var opsResult = OpGroup.getOpsUntilNewLineOrBlockOp(i, ops);
                i = opsResult.lastIndex;
                result.push(new OpGroup(op, opsResult.ops));
            }
            else if (op.isDataBlock()) {
                commitAndResetInlines();
                result.push(new OpGroup(op));
            }
            else {
                inlines.push(op);
            }
        }
        commitAndResetInlines();
        result.reverse();
        return result;
    };
    return OpGroup;
}());
exports.OpGroup = OpGroup;
