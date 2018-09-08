import { DeltaInsertOp } from './../DeltaInsertOp';
declare class InlineGroup {
    readonly ops: DeltaInsertOp[];
    constructor(ops: DeltaInsertOp[]);
}
declare class SingleItem {
    readonly op: DeltaInsertOp;
    constructor(op: DeltaInsertOp);
}
declare class VideoItem extends SingleItem {
}
declare class BlotBlock extends SingleItem {
}
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
declare type TDataGroup = VideoItem | InlineGroup | BlockGroup | ListItem | ListGroup;
export { VideoItem, BlotBlock, InlineGroup, BlockGroup, ListGroup, ListItem, TDataGroup };
