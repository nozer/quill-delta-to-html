import { DeltaInsertOp } from './../DeltaInsertOp';
declare class InlineGroup {
    readonly ops: DeltaInsertOp[];
    constructor(ops: DeltaInsertOp[]);
}
declare class VideoItem {
    readonly op: DeltaInsertOp;
    constructor(op: DeltaInsertOp);
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
export { VideoItem, InlineGroup, BlockGroup, ListGroup, ListItem, TDataGroup };
