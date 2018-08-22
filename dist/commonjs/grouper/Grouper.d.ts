import { DeltaInsertOp } from './../DeltaInsertOp';
import { BlockGroup, TDataGroup } from './group-types';
declare class Grouper {
    static pairOpsWithTheirBlock(ops: DeltaInsertOp[]): TDataGroup[];
    static groupConsecutiveSameStyleBlocks(groups: TDataGroup[], blocksOf?: {
        header: boolean;
        codeBlocks: boolean;
        blockquotes: boolean;
    }): Array<TDataGroup | BlockGroup[]>;
    static reduceConsecutiveSameStyleBlocksToOne(groups: Array<TDataGroup | BlockGroup[]>): TDataGroup[];
    static areBothCodeblocks(g1: BlockGroup, gOther: BlockGroup): boolean;
    static areBothSameHeadersWithSameAdi(g1: BlockGroup, gOther: BlockGroup): boolean;
    static areBothBlockquotesWithSameAdi(g: BlockGroup, gOther: BlockGroup): boolean;
}
export { Grouper };
