
import { InsertOpsConverter } from './InsertOpsConverter';
import { OpToHtmlConverter, IOpToHtmlConverterOptions, IHtmlParts } from './OpToHtmlConverter';
import { DeltaInsertOp } from './DeltaInsertOp';
import { Grouper } from './grouper/Grouper';
import {
    VideoItem, InlineGroup, BlockGroup, ListGroup, ListItem, TDataGroup
} from './grouper/group-types';
import { ListNester } from './grouper/ListNester';
import { makeStartTag, makeEndTag } from './funcs-html';
import './extensions/Object';
import { NewLine, GroupType } from './value-types';


interface IQuillDeltaToHtmlConverterOptions {
    // no more allowing these to be customized; unnecessary
    orderedListTag?: string,
    bulletListTag?: string,
    listItemTag?: string,

    paragraphTag?: string,
    classPrefix?: string,
    encodeHtml?: boolean,
    multiLineBlockquote?: boolean,
    multiLineHeader?: boolean,
    multiLineCodeblock?: boolean,

    linkRel?: string
}

const BrTag = '<br/>';

class QuillDeltaToHtmlConverter {

    private options: IQuillDeltaToHtmlConverterOptions;
    private rawDeltaOps: any[] = [];
    private converterOptions: IOpToHtmlConverterOptions;

    // render callbacks
    private callbacks: any = {};

    constructor(
        deltaOps: any[],
        options?: IQuillDeltaToHtmlConverterOptions) {

        this.options = Object._assign({
            paragraphTag: 'p',
            encodeHtml: true,
            classPrefix: 'ql',
            multiLineBlockquote: true,
            multiLineHeader: true,
            multiLineCodeblock: true
        }, options, {
            orderedListTag: 'ol',
            bulletListTag: 'ul',
            listItemTag: 'li'
        });

        this.converterOptions = {
            encodeHtml: this.options.encodeHtml,
            classPrefix: this.options.classPrefix,
            listItemTag: this.options.listItemTag,
            paragraphTag: this.options.paragraphTag,
            linkRel: this.options.linkRel
        };
        this.rawDeltaOps = deltaOps;

    }

    getListTag(op: DeltaInsertOp): string {
        return op.isOrderedList() ? this.options.orderedListTag + ''
            : op.isBulletList() ? this.options.bulletListTag + ''
                : '';
    }

    convert() {
        var deltaOps = InsertOpsConverter.convert(this.rawDeltaOps);

        var pairedOps = Grouper.pairOpsWithTheirBlock(deltaOps);

        var groupedSameStyleBlocks = Grouper.groupConsecutiveSameStyleBlocks(pairedOps, {
            blockquotes: !!this.options.multiLineBlockquote,
            header: !!this.options.multiLineHeader,
            codeBlocks: !!this.options.multiLineCodeblock
        });

        var groupedOps = Grouper.reduceConsecutiveSameStyleBlocksToOne(groupedSameStyleBlocks);
        var listNester = new ListNester();
        var groupListsNested = listNester.nest(groupedOps);

        var len = groupListsNested.length;
        var group: TDataGroup, html;
        var htmlArr: string[] = [];

        for (var i = 0; i < len; i++) {
            group = groupListsNested[i];

            if (group instanceof ListGroup) {

                html = this.renderWithCallbacks(
                    GroupType.List, group, () => this.renderList(<ListGroup>group));

            } else if (group instanceof BlockGroup) {

                var g = <BlockGroup>group;

                html = this.renderWithCallbacks(
                    GroupType.Block, group, () => this.renderBlock(g.op, g.ops));

            } else if (group instanceof VideoItem) {

                html = this.renderWithCallbacks(GroupType.Video, group, () => {
                    var g = <VideoItem>group;
                    var converter = new OpToHtmlConverter(g.op, this.converterOptions);
                    return converter.getHtml();
                });

            } else { // InlineGroup
                html = this.renderWithCallbacks(GroupType.InlineGroup, group, () => {
                    return this.renderInlines((<InlineGroup>group).ops);
                });
            }
            htmlArr.push(html);
        }

        return htmlArr.join('');
    }

    renderWithCallbacks(groupType: GroupType, group: TDataGroup, myRenderFn: () => string) {
        var html = '';
        var beforeCb = this.callbacks['beforeRender_cb'];
        html = typeof beforeCb === 'function' ? beforeCb.apply(null, [groupType, group]) : '';

        if (!html) {
            html = myRenderFn();
        }

        var afterCb = this.callbacks['afterRender_cb'];
        html = typeof afterCb === 'function' ? afterCb.apply(null, [groupType, html]) : html;

        return html;
    }

    renderList(list: ListGroup, isOuterMost = true): string {

        var firstItem  = list.items[0];
        return  makeStartTag(this.getListTag(firstItem.item.op))
            + list.items.map((li: ListItem) => this.renderListItem(li, isOuterMost)).join('')
            + makeEndTag(this.getListTag(firstItem.item.op));
    }

    renderListItem(li: ListItem, isOuterMost: boolean): string {
        var converterOptions = Object._assign({}, this.converterOptions);
        //if (!isOuterMost) {
            li.item.op.attributes.indent = 0;
        //}
        var converter = new OpToHtmlConverter(li.item.op, this.converterOptions);
        var parts = converter.getHtmlParts();
        var liElementsHtml = this.renderInlines(li.item.ops, false);
        return parts.openingTag + (liElementsHtml || BrTag) +
            (li.innerList ? this.renderList(li.innerList, false) : '')
            + parts.closingTag;
    }

    renderBlock(op: DeltaInsertOp, ops: DeltaInsertOp[]) {
        var converter = new OpToHtmlConverter(op, this.converterOptions);
        var htmlParts = converter.getHtmlParts();

        if (op.isCodeBlock()) {
            return htmlParts.openingTag +
                ops.map((op) => op.insert.value).join(NewLine)
                + htmlParts.closingTag;
        }

        var inlines = ops.map((op: DeltaInsertOp) => {
            var converter = new OpToHtmlConverter(op, this.converterOptions);
            return converter.getHtml().replace(/\n/g, BrTag);
        }).join(''); // this.renderInlines(ops, false);
        return htmlParts.openingTag + (inlines || BrTag) + htmlParts.closingTag;
    }

    renderInlines(ops: DeltaInsertOp[], wrapInParagraphTag = true) {

        var nlRx = /\n/g;
        var pStart = wrapInParagraphTag ? makeStartTag(this.options.paragraphTag) : '';
        var pEnd = wrapInParagraphTag ? makeEndTag(this.options.paragraphTag) : '';
        var opsLen = ops.length - 1;
        var html = pStart
            + ops.map((op: DeltaInsertOp, i: number) => {
                if (i === opsLen && op.isJustNewline()) {
                    return '';
                }
                var converter = new OpToHtmlConverter(op, this.converterOptions);
                return converter.getHtml().replace(nlRx, BrTag)
            }).join('')
            + pEnd;
        return html;
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

}

export { QuillDeltaToHtmlConverter };
