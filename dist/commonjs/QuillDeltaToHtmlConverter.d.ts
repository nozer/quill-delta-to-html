import { IOpToHtmlConverterOptions } from './OpToHtmlConverter';
import { DeltaInsertOp } from './DeltaInsertOp';
import {
  ListGroup,
  ListItem,
  TDataGroup,
  TableGroup,
  TableRow,
  TableCell,
} from './grouper/group-types';
import { GroupType } from './value-types';
import { IOpAttributeSanitizerOptions } from './OpAttributeSanitizer';
interface IQuillDeltaToHtmlConverterOptions
  extends IOpAttributeSanitizerOptions,
    IOpToHtmlConverterOptions {
  orderedListTag?: string;
  bulletListTag?: string;
  multiLineBlockquote?: boolean;
  multiLineHeader?: boolean;
  multiLineCodeblock?: boolean;
  multiLineParagraph?: boolean;
  multiLineCustomBlock?: boolean;
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
  _renderWithCallbacks(
    groupType: GroupType,
    group: TDataGroup,
    myRenderFn: () => string
  ): string;
  _renderList(list: ListGroup): string;
  _renderListItem(li: ListItem): string;
  _renderTable(table: TableGroup): string;
  _renderTableRow(row: TableRow): string;
  _renderTableCell(cell: TableCell): string;
  _renderBlock(bop: DeltaInsertOp, ops: DeltaInsertOp[]): string;
  _renderInlines(ops: DeltaInsertOp[], isInlineGroup?: boolean): string;
  _renderInline(op: DeltaInsertOp, contextOp: DeltaInsertOp | null): any;
  _renderCustom(op: DeltaInsertOp, contextOp: DeltaInsertOp | null): any;
  beforeRender(cb: (group: GroupType, data: TDataGroup) => string): void;
  afterRender(cb: (group: GroupType, html: string) => string): void;
  renderCustomWith(
    cb: (op: DeltaInsertOp, contextOp: DeltaInsertOp) => string
  ): void;
}
export { QuillDeltaToHtmlConverter };
