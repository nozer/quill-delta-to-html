
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
class VideoItem extends SingleItem {};
class BlotBlock extends SingleItem {};

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
    constructor(item: BlockGroup, innerList: ListGroup | null= null) {
        this.item = item;
        this.innerList = innerList;
    }
}

class TableCell extends BlockGroup {};
class TableGroup {
    rows: TableCell[][];
    constructor(rows: TableCell[][]) {
        this.rows = rows;
    }
}

type TDataGroup = VideoItem | InlineGroup | BlockGroup | ListItem | ListGroup | TableGroup;

export { VideoItem, BlotBlock, InlineGroup, BlockGroup, ListGroup, ListItem, TableCell, TableGroup, TDataGroup }; 