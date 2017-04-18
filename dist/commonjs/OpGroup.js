"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var funcs_misc_1 = require("./funcs-misc");
;
;
var OpGroup = (function () {
    function OpGroup(op, ops) {
        if (op === void 0) { op = null; }
        if (ops === void 0) { ops = null; }
        this.op = op;
        this.ops = ops;
    }
    OpGroup.getOpsSequenceWhile = function (startIndex, ops, predicate) {
        var result = {
            ops: [],
            lastUnprocessedIndex: startIndex
        };
        for (var i = startIndex - 1; i >= 0; i--) {
            var op = ops[i];
            if (!predicate(op)) {
                break;
            }
            result.lastUnprocessedIndex = i;
            result.ops.push(op);
        }
        result.ops.reverse();
        return result;
    };
    OpGroup.groupOps = function (ops) {
        var result = [];
        var canBeInBlock = function (op) {
            return !(op.isJustNewline() || op.isDataBlock() || op.isContainerBlock());
        };
        var isInlineData = function (op) { return op.isInline(); };
        var lastInd = ops.length - 1;
        var opsResult;
        for (var i = lastInd; i >= 0; i--) {
            var op = ops[i];
            if (op.isDataBlock()) {
                result.push(new OpGroup(op));
            }
            else if (op.isContainerBlock()) {
                opsResult = OpGroup.getOpsSequenceWhile(i, ops, canBeInBlock);
                result.push(new OpGroup(op, opsResult.ops));
                i = opsResult.lastUnprocessedIndex;
            }
            else {
                opsResult = OpGroup.getOpsSequenceWhile(i, ops, isInlineData);
                result.push(new OpGroup(null, opsResult.ops.concat(op)));
                i = opsResult.lastUnprocessedIndex;
            }
        }
        result.reverse();
        return OpGroup.moveConsecutiveCodeblockOpsToFirstGroup(result);
    };
    OpGroup.moveConsecutiveCodeblockOpsToFirstGroup = function (groups) {
        var codeblocksGrouped = funcs_misc_1.groupConsecutiveElementsWhile(groups, function (g) {
            return g.op && g.op.isCodeBlock();
        });
        return codeblocksGrouped.map(function (elm) {
            if (!Array.isArray(elm)) {
                return elm;
            }
            elm[0].ops = funcs_misc_1.flattenArray(elm.map(function (g) { return g.ops; }));
            return elm[0];
        });
    };
    return OpGroup;
}());
exports.OpGroup = OpGroup;
