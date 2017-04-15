
import {DeltaInsertOp} from './DeltaInsertOp';

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

class OpGroup implements IInlineOpGroup, IDataBlockOp, IBlockWrappedOpGroup {

    readonly op: DeltaInsertOp;
    readonly ops: DeltaInsertOp[];

    constructor(op: DeltaInsertOp = null, ops: DeltaInsertOp[] = null) {
        this.op = op;
        this.ops = ops;
    }

    static getOpsForBlock(currentIndex: number, ops: DeltaInsertOp[]) {
        var result = {
            ops: [] as DeltaInsertOp[],
            lastIndex: currentIndex
        };
        for (var i = currentIndex - 1; i >= 0; i--) {
            var op = ops[i];
            if (op.isDataBlock() || op.isContainerBlock()) {
                break;
            }
            if (op.isTextWithNewLine()) {
                var splitOps = op.splitByLastNewLine();
                ops[i] = splitOps[0];
                splitOps[1] && result.ops.push(splitOps[1]);
                break;
            }
            result.lastIndex = i;
            result.ops.push(op);
        }
        result.ops.reverse();
        return result;
    }

    static groupOps(ops: DeltaInsertOp[]): OpGroup[] {

        let result: OpGroup[] = [];
        let inlines: DeltaInsertOp[] = [];

        const commitAndResetInlines = () => {
            if (!inlines.length) { return; }
            inlines.reverse();
            result.push(new OpGroup(null, inlines) );
            inlines = [];
        };

        let lastInd = ops.length - 1;
        for (var i = lastInd; i >= 0; i--) {
            let op = ops[i];
            if (op.isContainerBlock()) {
                commitAndResetInlines();
                let opsResult = OpGroup.getOpsForBlock(i, ops);
                i = opsResult.lastIndex;
                result.push(new OpGroup(op,  opsResult.ops));

            } else if (op.isDataBlock()) {
                commitAndResetInlines();
                result.push(new OpGroup(op));
            } else {
                inlines.push(op);
            }
        }
        commitAndResetInlines();
        result.reverse();
        return result;
    }
}

export {
    OpGroup
}