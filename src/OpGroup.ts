
import { DeltaInsertOp } from './DeltaInsertOp';
import { NewLine } from './value-types';
import './extensions/Array';


class OpGroup {
    // Video or one of Block ops 
    op: DeltaInsertOp;

    // All other ops; if op is Block, these are its children; otherwise, 
    // op is null and they are inline group.
    ops: DeltaInsertOp[];

    constructor(op: DeltaInsertOp, ops: DeltaInsertOp[] = null) {
        this.op = op;
        this.ops = ops;
    }

    static pairOpsWithTheirBlock(ops: DeltaInsertOp[]): OpGroup[] {

        let result: OpGroup[] = [];

        const canBeInBlock = (op: DeltaInsertOp) => {
            return !(op.isJustNewline() || op.isVideo() || op.isContainerBlock());
        };
        const isInlineData = (op: DeltaInsertOp) => op.isInline();

        let lastInd = ops.length - 1;
        let opsSlice: IArraySlice;

        for (var i = lastInd; i >= 0; i--) {
            let op = ops[i];

            if (op.isVideo()) {
                result.push(new OpGroup(op));

            } else if (op.isContainerBlock()) {
                opsSlice = ops._sliceFromReverseWhile(i - 1, canBeInBlock);
                result.push(new OpGroup(op, opsSlice.elements));
                i = opsSlice.sliceStartsAt > -1 ? opsSlice.sliceStartsAt : i;

            } else {
                opsSlice = ops._sliceFromReverseWhile(i - 1, isInlineData);
                result.push(new OpGroup(null, opsSlice.elements.concat(op)));
                i = opsSlice.sliceStartsAt > -1 ? opsSlice.sliceStartsAt : i;
            }
        }
        result.reverse();
        return result;
    }

    static groupConsecutiveSameStyleBlocks(groups: OpGroup[], blocksOf = {
        header: true,
        codeBlocks: true,
        blockquotes: true
    }): Array<OpGroup | OpGroup[]> {
        return groups._groupConsecutiveElementsWhile((g: OpGroup, gPrev: OpGroup) => {
            return blocksOf.codeBlocks && OpGroup.areBothCodeblocks(g, gPrev)
                || blocksOf.blockquotes && OpGroup.areBothBlockquotesWithSameAdi(g, gPrev)
                || blocksOf.header && OpGroup.areBothSameHeadersWithSameAdi(g, gPrev);
        });
    }

    // Moves all ops of same style consecutive blocks to the ops of first block
    // and discards the rest. 
    static reduceConsecutiveSameStyleBlocksToOne(
        groups: Array<OpGroup | OpGroup[]>): OpGroup[] {

        var newLineOp = DeltaInsertOp.createNewLineOp();
        return groups.map(function (elm: any) {
            if (!Array.isArray(elm)) {
                return elm;
            }
            var groupsLastInd = elm.length - 1;
            elm[0].ops = elm.map((g: OpGroup, i: number) => {
                if (!g.ops.length) {
                    return [newLineOp];
                }
                return g.ops.concat(i < groupsLastInd ? [newLineOp] : []);
            })._flatten();
            return elm[0];
        });
    }

    static areBothCodeblocks(g1: OpGroup, gOther: OpGroup) {
        return g1.op && gOther.op && g1.op.isCodeBlock() && gOther.op.isCodeBlock();
    }

    static areBothSameHeadersWithSameAdi(g1: OpGroup, gOther: OpGroup) {
        return g1.op && gOther.op && g1.op.isSameHeaderAs(gOther.op)
            && g1.op.hasSameAdiAs(gOther.op);
    }

    static areBothBlockquotesWithSameAdi(g: OpGroup, gOther: OpGroup) {
        return g.op && gOther.op && g.op.isBlockquote() && gOther.op.isBlockquote()
            && g.op.hasSameAdiAs(gOther.op);
    }
}

export {
    OpGroup
}