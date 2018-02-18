
import { DeltaInsertOp } from './../DeltaInsertOp';
import { NewLine } from './../value-types';
import './../extensions/Array';

import {
   VideoItem, InlineGroup, BlockGroup, ListGroup, ListItem, TDataGroup
} from './group-types';
import { ListNester } from './ListNester';

class Grouper {

   static pairOpsWithTheirBlock(ops: DeltaInsertOp[]): TDataGroup[] {

      let result: TDataGroup[] = [];

      const canBeInBlock = (op: DeltaInsertOp) => {
         return !(op.isJustNewline() || op.isVideo() || op.isContainerBlock());
      };
      const isInlineData = (op: DeltaInsertOp) => op.isInline();

      let lastInd = ops.length - 1;
      let opsSlice: IArraySlice;

      for (var i = lastInd; i >= 0; i--) {
         let op = ops[i];

         if (op.isVideo()) {
            result.push(new VideoItem(op));
         
         } else if (op.isContainerBlock()) {
            opsSlice = ops._sliceFromReverseWhile(i - 1, canBeInBlock);

            result.push(new BlockGroup(op, opsSlice.elements));
            i = opsSlice.sliceStartsAt > -1 ? opsSlice.sliceStartsAt : i;

         } else {
            opsSlice = ops._sliceFromReverseWhile(i - 1, isInlineData);
            result.push(new InlineGroup(opsSlice.elements.concat(op)));
            i = opsSlice.sliceStartsAt > -1 ? opsSlice.sliceStartsAt : i;
         }
      }
      result.reverse();
      return result;
   }

   static groupConsecutiveSameStyleBlocks(groups: TDataGroup[], blocksOf = {
      header: true,
      codeBlocks: true,
      blockquotes: true
   }): Array<TDataGroup | BlockGroup[]> {

      return groups._groupConsecutiveElementsWhile((g: TDataGroup, gPrev: TDataGroup) => {
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
         elm[0].ops = elm.map((g: BlockGroup, i: number) => {
            if (!g.ops.length) {
               return [newLineOp];
            }
            return g.ops.concat(i < groupsLastInd ? [newLineOp] : []);
         })._flatten();
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