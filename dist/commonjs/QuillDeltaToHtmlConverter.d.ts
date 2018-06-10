import { DeltaInsertOp } from './DeltaInsertOp';
import { ListGroup, ListItem, TDataGroup } from './grouper/group-types';
import './extensions/Object';
import { GroupType } from './value-types';
interface IQuillDeltaToHtmlConverterOptions {
    orderedListTag?: string;
    bulletListTag?: string;
    listItemTag?: string;
    paragraphTag?: string;
    classPrefix?: string;
    encodeHtml?: boolean;
    multiLineBlockquote?: boolean;
    multiLineHeader?: boolean;
    multiLineCodeblock?: boolean;
    linkRel?: string;
    linkTarget?: string;
    allowBackgroundClasses?: boolean;
}
declare class QuillDeltaToHtmlConverter {
    private options;
    private rawDeltaOps;
    private converterOptions;
    private callbacks;
    constructor(deltaOps: any[], options?: IQuillDeltaToHtmlConverterOptions);
    _getListTag(op: DeltaInsertOp): string;
    getGroupedOps(): TDataGroup[];
    convert(): string;
    _renderWithCallbacks(groupType: GroupType, group: TDataGroup, myRenderFn: () => string): string;
    _renderList(list: ListGroup, isOuterMost?: boolean): string;
    _renderListItem(li: ListItem, isOuterMost: boolean): string;
    _renderBlock(bop: DeltaInsertOp, ops: DeltaInsertOp[]): string;
    _renderInlines(ops: DeltaInsertOp[], wrapInParagraphTag?: boolean): string;
    _renderInline(op: DeltaInsertOp, contextOp: DeltaInsertOp): any;
    _renderCustom(op: DeltaInsertOp, contextOp: DeltaInsertOp): any;
    beforeRender(cb: (group: GroupType, data: TDataGroup) => string): void;
    afterRender(cb: (group: GroupType, html: string) => string): void;
    renderCustomWith(cb: (op: DeltaInsertOp, contextOp: DeltaInsertOp) => string): void;
}
export { QuillDeltaToHtmlConverter };
