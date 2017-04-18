
import {DeltaInsertOp} from './DeltaInsertOp';
import {NewLine} from './value-types';
import {groupConsecutiveElementsWhile, flattenArray} from './funcs-misc';

interface IInlineOpGroup  {
    // all inline ops 
    ops: DeltaInsertOp[]
};

interface IDataBlockOp {
    // an op that is both data and block, such as video 
    op: DeltaInsertOp
};

interface IBlockWrappedOpGroup {
    // block op that wraps around data like blockquote, header, etc 
    op: DeltaInsertOp,
    // inline ops contained within that block
    ops: DeltaInsertOp[]
}

interface IOpsSequence {
    ops: DeltaInsertOp[],
    lastUnprocessedIndex: number
}

class OpGroup implements IInlineOpGroup, IDataBlockOp, IBlockWrappedOpGroup {

    op: DeltaInsertOp;
    ops: DeltaInsertOp[];

    constructor(op: DeltaInsertOp = null, ops: DeltaInsertOp[] = null) {
        this.op = op;
        this.ops = ops;
    }

    static getOpsSequenceWhile(startIndex: number, ops: DeltaInsertOp[], 
                            predicate: (op: DeltaInsertOp) => boolean): IOpsSequence {
        var result = {
            ops: [] as DeltaInsertOp[],
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
    }

    static groupOps(ops: DeltaInsertOp[]): OpGroup[] {

        let result: OpGroup[] = [];

        const canBeInBlock = (op: DeltaInsertOp) => {
            return !(op.isJustNewline() || op.isDataBlock() || op.isContainerBlock());
        };
        const isInlineData = (op: DeltaInsertOp) => op.isInline(); 

        let lastInd = ops.length - 1;
        let opsResult: IOpsSequence;
        for (var i = lastInd; i >= 0; i--) {
            let op = ops[i];
            
            if (op.isDataBlock()) {
                result.push(new OpGroup(op));

            } else if (op.isContainerBlock()) {

                opsResult = OpGroup.getOpsSequenceWhile(i, ops, canBeInBlock);
                result.push(new OpGroup(op, opsResult.ops));
                i = opsResult.lastUnprocessedIndex;
            } else {

                opsResult = OpGroup.getOpsSequenceWhile(i, ops, isInlineData);
                result.push(new OpGroup(null, opsResult.ops.concat(op)));
                i = opsResult.lastUnprocessedIndex;
            }
        }
        result.reverse();

        return OpGroup.moveConsecutiveCodeblockOpsToFirstGroup(result);
    }
    
    static moveConsecutiveCodeblockOpsToFirstGroup(groups: OpGroup[]) {
        var codeblocksGrouped = groupConsecutiveElementsWhile(groups, (g: OpGroup) => {
            return g.op && g.op.isCodeBlock();
        });
        
        return codeblocksGrouped.map(function(elm: any){
            if (!Array.isArray(elm)) {
                return elm;
            }
            elm[0].ops = flattenArray(elm.map((g: OpGroup) => g.ops));
            return elm[0];
        });
    }
}

export {
    OpGroup
}