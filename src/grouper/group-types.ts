
import { DeltaInsertOp } from './../DeltaInsertOp';

class InlineGroup {
    readonly ops: DeltaInsertOp[];
    constructor(ops: DeltaInsertOp[]) {
        this.ops = ops;
    }
}

class VideoItem {
    readonly op: DeltaInsertOp;
    constructor(op: DeltaInsertOp) {
        this.op = op;
    }
}

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
    innerList: ListGroup;
    constructor(item: BlockGroup, innerList: ListGroup = null) {
        this.item = item;
        this.innerList = innerList;
    }
}

type TDataGroup = VideoItem | InlineGroup | BlockGroup | ListItem | ListGroup;

export { VideoItem, InlineGroup, BlockGroup, ListGroup, ListItem, TDataGroup }; 