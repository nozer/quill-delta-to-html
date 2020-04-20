import { DeltaInsertOp } from './../DeltaInsertOp';
declare class InlineGroup {
  readonly ops: DeltaInsertOp[];
  constructor(ops: DeltaInsertOp[]);
}
declare class SingleItem {
  readonly op: DeltaInsertOp;
  constructor(op: DeltaInsertOp);
}
declare class VideoItem extends SingleItem {}
declare class BlotBlock extends SingleItem {}
declare class BlockGroup {
  readonly op: DeltaInsertOp;
  ops: DeltaInsertOp[];
  constructor(op: DeltaInsertOp, ops: DeltaInsertOp[]);
}
declare class ListGroup {
  items: ListItem[];
  constructor(items: ListItem[]);
}
declare class ListItem {
  readonly item: BlockGroup;
  innerList: ListGroup | null;
  constructor(item: BlockGroup, innerList?: ListGroup | null);
}
declare class TableGroup {
  rows: TableRow[];
  constructor(rows: TableRow[]);
}
declare class TableRow {
  cells: TableCell[];
  constructor(cells: TableCell[]);
}
declare class TableCell {
  readonly item: BlockGroup;
  constructor(item: BlockGroup);
}
declare type TDataGroup =
  | VideoItem
  | InlineGroup
  | BlockGroup
  | ListItem
  | ListGroup
  | TableGroup
  | TableRow
  | TableCell;
export {
  VideoItem,
  BlotBlock,
  InlineGroup,
  BlockGroup,
  ListGroup,
  ListItem,
  TableGroup,
  TableRow,
  TableCell,
  TDataGroup,
};
