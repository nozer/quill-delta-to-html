
import { DeltaInsertOp } from './../DeltaInsertOp';
import {IArraySlice, flatten, groupConsecutiveElementsWhile, sliceFromReverseWhile, partitionAtIndexes} from './../helpers/array';

import {
   VideoItem, InlineGroup, BlockGroup, TDataGroup, BlotBlock, TableGroup, TableCell
} from './group-types';

class Grouper {

   static pairOpsWithTheirBlock(ops: DeltaInsertOp[]): TDataGroup[] {

      let result: TDataGroup[] = [];

      const canBeInBlock = (op: DeltaInsertOp) => {
         return !(op.isJustNewline() || op.isCustomBlock() || op.isVideo() || op.isContainerBlock());
      };
      const isInlineData = (op: DeltaInsertOp) => op.isInline();

      let lastInd = ops.length - 1;
      let opsSlice: IArraySlice<DeltaInsertOp>;

      for (var i = lastInd; i >= 0; i--) {
         let op = ops[i];

         if (op.isVideo()) {
            result.push(new VideoItem(op));

         } else if (op.isTable()) {
            opsSlice = sliceFromReverseWhile(ops, i, op => {
               return canBeInBlock(op) || op.isTable();
            });
            result.push(this.makeTableGroupFromOps(opsSlice.elements));
            i = opsSlice.sliceStartsAt > -1 ? opsSlice.sliceStartsAt : i;

         } else if (op.isCustomBlock()) {
            result.push(new BlotBlock(op));
            
         } else if (op.isContainerBlock()) {
            opsSlice = sliceFromReverseWhile(ops, i - 1, canBeInBlock);

            result.push(new BlockGroup(op, opsSlice.elements));
            i = opsSlice.sliceStartsAt > -1 ? opsSlice.sliceStartsAt : i;

         } else {
            opsSlice = sliceFromReverseWhile(ops, i - 1, isInlineData);
            result.push(new InlineGroup(opsSlice.elements.concat(op)));
            i = opsSlice.sliceStartsAt > -1 ? opsSlice.sliceStartsAt : i;
         }
      }
      result.reverse();
      return result;
   }

   static makeTableGroupFromOps(ops: DeltaInsertOp[])  {
      let initial: {[k: string]: number} = {};
      let lastCellIndexesOnEachRow = ops.reduce((pv, op, i) => {
         if (op.attributes.table){
            pv[op.attributes.table] = i;
         }
         return pv;
      }, initial);
      let indexes = Object.keys(lastCellIndexesOnEachRow).map( k => lastCellIndexesOnEachRow[k]);
      let rawRows = partitionAtIndexes<DeltaInsertOp>(ops, indexes);
      let rows: TableCell[][] = rawRows.map(Grouper.makeTableCellsForRow);
      return new TableGroup(rows);
   }

   static makeTableCellsForRow(ops: DeltaInsertOp[]) {
      let initial: number[] = []
      let lastCellIndexesOnEachCol = ops.reduce((pv, op, i) => {
         if (op.attributes.table){
            pv.push(i);
         }
         return pv;
      }, initial);
      let indexes = lastCellIndexesOnEachCol;
      let rawCols = partitionAtIndexes<DeltaInsertOp>(ops, indexes);
      return rawCols.map(cells => {
         let cellOp = cells.find(cell => cell.attributes.table)!
         return new TableCell(cellOp, cells.filter(cell => !cell.attributes.table))
      });
   }

   static groupConsecutiveSameStyleBlocks(groups: TDataGroup[], blocksOf = {
      header: true,
      codeBlocks: true,
      blockquotes: true
   }): Array<TDataGroup | BlockGroup[]> {

      return groupConsecutiveElementsWhile(groups, (g: TDataGroup, gPrev: TDataGroup) => {
         if (!(g instanceof BlockGroup) || !(gPrev instanceof BlockGroup)) {
            return false;
         }

         return blocksOf.codeBlocks && Grouper.areBothCodeblocks(g, gPrev)
            || blocksOf.blockquotes && Grouper.areBothBlockquotesWithSameAdi(g, gPrev)
            || blocksOf.header && Grouper.areBothSameHeadersWithSameAdi(g, gPrev);
      });
   }

   // Moves all ops of same style consecutive blocks to the ops of first block
   // and discards the rest. 
   static reduceConsecutiveSameStyleBlocksToOne(
      groups: Array<TDataGroup | BlockGroup[]>): TDataGroup[] {

      var newLineOp = DeltaInsertOp.createNewLineOp();
      return groups.map(function (elm: TDataGroup | BlockGroup[]) {
         if (!Array.isArray(elm)) {
            if (elm instanceof BlockGroup && !elm.ops.length) {
               elm.ops.push(newLineOp);
            }
            return elm;
         }
         var groupsLastInd = elm.length - 1;
         elm[0].ops = flatten(elm.map((g: BlockGroup, i: number) => {
            if (!g.ops.length) {
               return [newLineOp];
            }
            return g.ops.concat(i < groupsLastInd ? [newLineOp] : []);
         }));
         return elm[0];
      });
   }

   static areBothCodeblocks(g1: BlockGroup, gOther: BlockGroup) {
      return g1.op.isCodeBlock() && gOther.op.isCodeBlock();
   }

   static areBothSameHeadersWithSameAdi(g1: BlockGroup, gOther: BlockGroup) {
      return g1.op.isSameHeaderAs(gOther.op) && g1.op.hasSameAdiAs(gOther.op);
   }

   static areBothBlockquotesWithSameAdi(g: BlockGroup, gOther: BlockGroup) {
      return g.op.isBlockquote() && gOther.op.isBlockquote()
         && g.op.hasSameAdiAs(gOther.op);
   }
}

export {
   Grouper
}