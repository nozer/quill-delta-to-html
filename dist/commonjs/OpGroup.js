"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DeltaInsertOp_1 = require("./DeltaInsertOp");
require("./extensions/Array");
var OpGroup = (function () {
    function OpGroup(op, ops) {
        if (ops === void 0) { ops = null; }
        this.op = op;
        this.ops = ops;
    }
    OpGroup.pairOpsWithTheirBlock = function (ops) {
        var result = [];
        var canBeInBlock = function (op) {
            return !(op.isJustNewline() || op.isVideo() || op.isContainerBlock());
        };
        var isInlineData = function (op) { return op.isInline(); };
        var lastInd = ops.length - 1;
        var opsSlice;
        for (var i = lastInd; i >= 0; i--) {
            var op = ops[i];
            if (op.isVideo()) {
                result.push(new OpGroup(op));
            }
            else if (op.isContainerBlock()) {
                opsSlice = ops._sliceFromReverseWhile(i - 1, canBeInBlock);
                result.push(new OpGroup(op, opsSlice.elements));
                i = opsSlice.sliceStartsAt > -1 ? opsSlice.sliceStartsAt : i;
            }
            else {
                opsSlice = ops._sliceFromReverseWhile(i - 1, isInlineData);
                result.push(new OpGroup(null, opsSlice.elements.concat(op)));
                i = opsSlice.sliceStartsAt > -1 ? opsSlice.sliceStartsAt : i;
            }
        }
        result.reverse();
        return result;
    };
    OpGroup.groupConsecutiveSameStyleBlocks = function (groups, blocksOf) {
        if (blocksOf === void 0) { blocksOf = {
            header: true,
            codeBlocks: true,
            blockquotes: true
        }; }
        return groups._groupConsecutiveElementsWhile(function (g, gPrev) {
            return blocksOf.codeBlocks && OpGroup.areBothCodeblocks(g, gPrev)
                || blocksOf.blockquotes && OpGroup.areBothBlockquotesWithSameAdi(g, gPrev)
                || blocksOf.header && OpGroup.areBothSameHeadersWithSameAdi(g, gPrev);
        });
    };
    OpGroup.reduceConsecutiveSameStyleBlocksToOne = function (groups) {
        var newLineOp = DeltaInsertOp_1.DeltaInsertOp.createNewLineOp();
        return groups.map(function (elm) {
            if (!Array.isArray(elm)) {
                return elm;
            }
            var groupsLastInd = elm.length - 1;
            elm[0].ops = elm.map(function (g, i) {
                if (!g.ops.length) {
                    return [newLineOp];
                }
                return g.ops.concat(i < groupsLastInd ? [newLineOp] : []);
            })._flatten();
            return elm[0];
        });
    };
    OpGroup.areBothCodeblocks = function (g1, gOther) {
        return g1.op && gOther.op && g1.op.isCodeBlock() && gOther.op.isCodeBlock();
    };
    OpGroup.areBothSameHeadersWithSameAdi = function (g1, gOther) {
        return g1.op && gOther.op && g1.op.isSameHeaderAs(gOther.op)
            && g1.op.hasSameAdiAs(gOther.op);
    };
    OpGroup.areBothBlockquotesWithSameAdi = function (g, gOther) {
        return g.op && gOther.op && g.op.isBlockquote() && gOther.op.isBlockquote()
            && g.op.hasSameAdiAs(gOther.op);
    };
    return OpGroup;
}());
exports.OpGroup = OpGroup;
