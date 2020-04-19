import { DeltaInsertOp } from './../DeltaInsertOp';

class InlineGroup {
  readonly ops: DeltaInsertOp[];
  constructor(ops: DeltaInsertOp[]) {
    this.ops = ops;
  }
}

class SingleItem {
  readonly op: DeltaInsertOp;
  constructor(op: DeltaInsertOp) {
    this.op = op;
  }
}
class VideoItem extends SingleItem {}
class BlotBlock extends SingleItem {}

class BlockGroup {
  readonly op: DeltaInsertOp;
  ops: DeltaInsertOp[];
  constructor(op: DeltaInsertOp, ops: DeltaInsertOp[]) {
    this.op = op;
    this.ops = ops;
  }
}

class ListGroup {
  items: ListItem[];
  constructor(items: ListItem[]) {
    this.items = items;
  }
}

class ListItem {
  readonly item: BlockGroup;
  innerList: ListGroup | null;
  constructor(item: BlockGroup, innerList: ListGroup | null = null) {
    this.item = item;
    this.innerList = innerList;
  }
}

class TableGroup {
  rows: TableRow[];
  constructor(rows: TableRow[]) {
    this.rows = rows;
  }
}

class TableRow {
  cells: TableCell[];
  constructor(cells: TableCell[]) {
    this.cells = cells;
  }
}

class TableCell {
  readonly item: BlockGroup;
  constructor(item: BlockGroup) {
    this.item = item;
  }
}

type TDataGroup =
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
