import {
  TDataGroup,
  TableGroup,
  BlockGroup,
  TableRow,
  TableCell,
} from './group-types';
import { groupConsecutiveElementsWhile } from '../helpers/array';

export class TableGrouper {
  group(groups: TDataGroup[]): TDataGroup[] {
    var tableBlocked = this.convertTableBlocksToTableGroups(groups);
    return tableBlocked;
  }

  private convertTableBlocksToTableGroups(
    items: TDataGroup[]
  ): Array<TDataGroup> {
    var grouped = groupConsecutiveElementsWhile(
      items,
      (g: TDataGroup, gPrev: TDataGroup) => {
        return (
          g instanceof BlockGroup &&
          gPrev instanceof BlockGroup &&
          g.op.isTable() &&
          gPrev.op.isTable()
        );
      }
    );

    return grouped.map((item: TDataGroup | BlockGroup[]) => {
      if (!Array.isArray(item)) {
        if (item instanceof BlockGroup && item.op.isTable()) {
          return new TableGroup([new TableRow([new TableCell(item)])]);
        }
        return item;
      }
      return new TableGroup(this.convertTableBlocksToTableRows(item));
    });
  }

  private convertTableBlocksToTableRows(items: TDataGroup[]): TableRow[] {
    var grouped = groupConsecutiveElementsWhile(
      items,
      (g: TDataGroup, gPrev: TDataGroup) => {
        return (
          g instanceof BlockGroup &&
          gPrev instanceof BlockGroup &&
          g.op.isTable() &&
          gPrev.op.isTable() &&
          g.op.isSameTableRowAs(gPrev.op)
        );
      }
    );
    return grouped.map((item: BlockGroup | BlockGroup[]) => {
      return new TableRow(
        Array.isArray(item)
          ? item.map((it) => new TableCell(it))
          : [new TableCell(item)]
      );
    });
  }
}
