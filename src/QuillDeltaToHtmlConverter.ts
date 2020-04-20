import { InsertOpsConverter } from './InsertOpsConverter';
import {
  OpToHtmlConverter,
  IOpToHtmlConverterOptions,
  IInlineStyles,
} from './OpToHtmlConverter';
import { DeltaInsertOp } from './DeltaInsertOp';
import { Grouper } from './grouper/Grouper';
import {
  VideoItem,
  InlineGroup,
  BlockGroup,
  ListGroup,
  ListItem,
  TDataGroup,
  BlotBlock,
  TableGroup,
  TableRow,
  TableCell,
} from './grouper/group-types';
import { ListNester } from './grouper/ListNester';
import { makeStartTag, makeEndTag, encodeHtml } from './funcs-html';
import * as obj from './helpers/object';
import { GroupType } from './value-types';
import { IOpAttributeSanitizerOptions } from './OpAttributeSanitizer';
import { TableGrouper } from './grouper/TableGrouper';

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

const BrTag = '<br/>';

class QuillDeltaToHtmlConverter {
  private options: IQuillDeltaToHtmlConverterOptions;
  private rawDeltaOps: any[] = [];
  private converterOptions: IOpToHtmlConverterOptions;

  // render callbacks
  private callbacks: any = {};

  constructor(deltaOps: any[], options?: IQuillDeltaToHtmlConverterOptions) {
    this.options = obj.assign(
      {
        paragraphTag: 'p',
        encodeHtml: true,
        classPrefix: 'ql',
        inlineStyles: false,
        multiLineBlockquote: true,
        multiLineHeader: true,
        multiLineCodeblock: true,
        multiLineParagraph: true,
        multiLineCustomBlock: true,
        allowBackgroundClasses: false,
        linkTarget: '_blank',
      },
      options,
      {
        orderedListTag: 'ol',
        bulletListTag: 'ul',
        listItemTag: 'li',
      }
    );

    var inlineStyles: IInlineStyles | undefined;
    if (!this.options.inlineStyles) {
      inlineStyles = undefined;
    } else if (typeof this.options.inlineStyles === 'object') {
      inlineStyles = this.options.inlineStyles;
    } else {
      inlineStyles = {};
    }

    this.converterOptions = {
      encodeHtml: this.options.encodeHtml,
      classPrefix: this.options.classPrefix,
      inlineStyles: inlineStyles,
      listItemTag: this.options.listItemTag,
      paragraphTag: this.options.paragraphTag,
      linkRel: this.options.linkRel,
      linkTarget: this.options.linkTarget,
      allowBackgroundClasses: this.options.allowBackgroundClasses,
      customTag: this.options.customTag,
      customTagAttributes: this.options.customTagAttributes,
      customCssClasses: this.options.customCssClasses,
      customCssStyles: this.options.customCssStyles,
    };
    this.rawDeltaOps = deltaOps;
  }

  _getListTag(op: DeltaInsertOp): string {
    return op.isOrderedList()
      ? this.options.orderedListTag + ''
      : op.isBulletList()
      ? this.options.bulletListTag + ''
      : op.isCheckedList()
      ? this.options.bulletListTag + ''
      : op.isUncheckedList()
      ? this.options.bulletListTag + ''
      : '';
  }

  getGroupedOps(): TDataGroup[] {
    var deltaOps = InsertOpsConverter.convert(this.rawDeltaOps, this.options);

    var pairedOps = Grouper.pairOpsWithTheirBlock(deltaOps);

    var groupedSameStyleBlocks = Grouper.groupConsecutiveSameStyleBlocks(
      pairedOps,
      {
        blockquotes: !!this.options.multiLineBlockquote,
        header: !!this.options.multiLineHeader,
        codeBlocks: !!this.options.multiLineCodeblock,
        customBlocks: !!this.options.multiLineCustomBlock,
      }
    );

    var groupedOps = Grouper.reduceConsecutiveSameStyleBlocksToOne(
      groupedSameStyleBlocks
    );

    var tableGrouper = new TableGrouper();
    groupedOps = tableGrouper.group(groupedOps);

    var listNester = new ListNester();
    return listNester.nest(groupedOps);
  }

  convert() {
    let groups = this.getGroupedOps();
    return groups
      .map((group) => {
        if (group instanceof ListGroup) {
          return this._renderWithCallbacks(GroupType.List, group, () =>
            this._renderList(<ListGroup>group)
          );
        } else if (group instanceof TableGroup) {
          return this._renderWithCallbacks(GroupType.Table, group, () =>
            this._renderTable(<TableGroup>group)
          );
        } else if (group instanceof BlockGroup) {
          var g = <BlockGroup>group;

          return this._renderWithCallbacks(GroupType.Block, group, () =>
            this._renderBlock(g.op, g.ops)
          );
        } else if (group instanceof BlotBlock) {
          return this._renderCustom(group.op, null);
        } else if (group instanceof VideoItem) {
          return this._renderWithCallbacks(GroupType.Video, group, () => {
            var g = <VideoItem>group;
            var converter = new OpToHtmlConverter(g.op, this.converterOptions);
            return converter.getHtml();
          });
        } else {
          // InlineGroup
          return this._renderWithCallbacks(GroupType.InlineGroup, group, () => {
            return this._renderInlines((<InlineGroup>group).ops, true);
          });
        }
      })
      .join('');
  }

  _renderWithCallbacks(
    groupType: GroupType,
    group: TDataGroup,
    myRenderFn: () => string
  ) {
    var html = '';
    var beforeCb = this.callbacks['beforeRender_cb'];
    html =
      typeof beforeCb === 'function'
        ? beforeCb.apply(null, [groupType, group])
        : '';

    if (!html) {
      html = myRenderFn();
    }

    var afterCb = this.callbacks['afterRender_cb'];
    html =
      typeof afterCb === 'function'
        ? afterCb.apply(null, [groupType, html])
        : html;

    return html;
  }

  _renderList(list: ListGroup): string {
    var firstItem = list.items[0];
    return (
      makeStartTag(this._getListTag(firstItem.item.op)) +
      list.items.map((li: ListItem) => this._renderListItem(li)).join('') +
      makeEndTag(this._getListTag(firstItem.item.op))
    );
  }

  _renderListItem(li: ListItem): string {
    //if (!isOuterMost) {
    li.item.op.attributes.indent = 0;
    //}
    var converter = new OpToHtmlConverter(li.item.op, this.converterOptions);
    var parts = converter.getHtmlParts();
    var liElementsHtml = this._renderInlines(li.item.ops, false);
    return (
      parts.openingTag +
      liElementsHtml +
      (li.innerList ? this._renderList(li.innerList) : '') +
      parts.closingTag
    );
  }

  _renderTable(table: TableGroup): string {
    return (
      makeStartTag('table') +
      makeStartTag('tbody') +
      table.rows.map((row: TableRow) => this._renderTableRow(row)).join('') +
      makeEndTag('tbody') +
      makeEndTag('table')
    );
  }

  _renderTableRow(row: TableRow): string {
    return (
      makeStartTag('tr') +
      row.cells.map((cell: TableCell) => this._renderTableCell(cell)).join('') +
      makeEndTag('tr')
    );
  }

  _renderTableCell(cell: TableCell): string {
    var converter = new OpToHtmlConverter(cell.item.op, this.converterOptions);
    var parts = converter.getHtmlParts();
    var cellElementsHtml = this._renderInlines(cell.item.ops, false);
    return (
      makeStartTag('td', {
        key: 'data-row',
        value: cell.item.op.attributes.table,
      }) +
      parts.openingTag +
      cellElementsHtml +
      parts.closingTag +
      makeEndTag('td')
    );
  }

  _renderBlock(bop: DeltaInsertOp, ops: DeltaInsertOp[]) {
    var converter = new OpToHtmlConverter(bop, this.converterOptions);
    var htmlParts = converter.getHtmlParts();

    if (bop.isCodeBlock()) {
      return (
        htmlParts.openingTag +
        encodeHtml(
          ops
            .map((iop) =>
              iop.isCustomEmbed()
                ? this._renderCustom(iop, bop)
                : iop.insert.value
            )
            .join('')
        ) +
        htmlParts.closingTag
      );
    }

    var inlines = ops.map((op) => this._renderInline(op, bop)).join('');
    return htmlParts.openingTag + (inlines || BrTag) + htmlParts.closingTag;
  }

  _renderInlines(ops: DeltaInsertOp[], isInlineGroup = true) {
    var opsLen = ops.length - 1;
    var html = ops
      .map((op: DeltaInsertOp, i: number) => {
        if (i > 0 && i === opsLen && op.isJustNewline()) {
          return '';
        }
        return this._renderInline(op, null);
      })
      .join('');
    if (!isInlineGroup) {
      return html;
    }

    let startParaTag = makeStartTag(this.options.paragraphTag);
    let endParaTag = makeEndTag(this.options.paragraphTag);
    if (html === BrTag || this.options.multiLineParagraph) {
      return startParaTag + html + endParaTag;
    }
    return (
      startParaTag +
      html
        .split(BrTag)
        .map((v) => {
          return v === '' ? BrTag : v;
        })
        .join(endParaTag + startParaTag) +
      endParaTag
    );
  }

  _renderInline(op: DeltaInsertOp, contextOp: DeltaInsertOp | null) {
    if (op.isCustomEmbed()) {
      return this._renderCustom(op, contextOp);
    }
    var converter = new OpToHtmlConverter(op, this.converterOptions);
    return converter.getHtml().replace(/\n/g, BrTag);
  }

  _renderCustom(op: DeltaInsertOp, contextOp: DeltaInsertOp | null) {
    var renderCb = this.callbacks['renderCustomOp_cb'];
    if (typeof renderCb === 'function') {
      return renderCb.apply(null, [op, contextOp]);
    }
    return '';
  }

  beforeRender(cb: (group: GroupType, data: TDataGroup) => string) {
    if (typeof cb === 'function') {
      this.callbacks['beforeRender_cb'] = cb;
    }
  }

  afterRender(cb: (group: GroupType, html: string) => string) {
    if (typeof cb === 'function') {
      this.callbacks['afterRender_cb'] = cb;
    }
  }

  renderCustomWith(
    cb: (op: DeltaInsertOp, contextOp: DeltaInsertOp) => string
  ) {
    this.callbacks['renderCustomOp_cb'] = cb;
  }
}

export { QuillDeltaToHtmlConverter };
