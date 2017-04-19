
import { InsertOpsConverter } from './InsertOpsConverter';
import { OpToHtmlConverter, IOpToHtmlConverterOptions, IHtmlParts } from './OpToHtmlConverter';
import { DeltaInsertOp } from './DeltaInsertOp';
import { OpGroup } from './OpGroup';
import { makeStartTag, makeEndTag } from './funcs-html';
import './extensions/Object';
import { NewLine } from './value-types';


interface IQuillDeltaToHtmlConverterOptions {
    orderedListTag?: string,
    bulletListTag?: string,
    listItemTag?: string,
    paragraphTag?: string,
    classPrefix?: string,
    encodeHtml?: boolean,
    multiLineBlockquote?: boolean,
    multiLineHeader?: boolean,
    multiLineCodeblock?: boolean
}

const BrTag = '<br/>';

class QuillDeltaToHtmlConverter {

    private options: IQuillDeltaToHtmlConverterOptions;
    private rawDeltaOps: any[] = [];
    private converter: OpToHtmlConverter;

    // render callbacks 
    private callbacks: any = {};

    constructor(
        deltaOps: any[],
        options?: IQuillDeltaToHtmlConverterOptions) {

        this.options = Object._assign({
            orderedListTag: 'ol',
            bulletListTag: 'ul',
            listItemTag: 'li',
            paragraphTag: 'p',
            encodeHtml: true,
            classPrefix: 'ql',
            multiLineBlockquote: true,
            multiLineHeader: true,
            multiLineCodeblock: true
        }, options);

        this.converter = new OpToHtmlConverter({
            encodeHtml: this.options.encodeHtml,
            classPrefix: this.options.classPrefix,
            listItemTag: this.options.listItemTag,
            paragraphTag: this.options.paragraphTag
        });
        this.rawDeltaOps = deltaOps;

    }

    getListTag(op: DeltaInsertOp): string {
        return op.isOrderedList() ? this.options.orderedListTag + ''
            : op.isBulletList() ? this.options.bulletListTag + ''
                : '';
    }

    convert() {
        var deltaOps = InsertOpsConverter.convert(this.rawDeltaOps);

        // holds the list tags(ol, ul) that are opened and needs closing
        var tagStack: string[] = [];

        // holds html string being built
        var htmlArr: string[] = [];

        const beginListTag = (tag: string) => {
            tag && tagStack.push(tag) && htmlArr.push('<' + tag + '>');
        };

        const endListTag = (shouldEndAllTags: boolean = false) => {
            var endTag = () => {
                var tag = tagStack.pop();
                tag && htmlArr.push('</' + tag + '>');
            };
            shouldEndAllTags ? tagStack.map(endTag) : endTag();
        };

        const callCustomRenderCb = function (cbName: string, args: any) {
            cbName += '_cb';
            if (typeof this.callbacks[cbName] === 'function') {
                return this.callbacks[cbName].apply(null, args);
            }
            // return original html if this is an after call back, otherwise undef
            return cbName.indexOf('after') === 0 ? args[0] : undefined;
        }.bind(this);

        var pairedOps = OpGroup.pairOpsWithTheirBlock(deltaOps);
        var groupedSameStyleBlocks = OpGroup.groupConsecutiveSameStyleBlocks(pairedOps, {
            blockquotes: !!this.options.multiLineBlockquote,
            header: !!this.options.multiLineHeader,
            codeBlocks: !!this.options.multiLineCodeblock
        });
        var groupedOps = OpGroup.reduceConsecutiveSameStyleBlocksToOne(groupedSameStyleBlocks);

        var len = groupedOps.length;
        var group, prevGroup, html, prevOp;

        const prevOpFn = (pg: OpGroup) => pg.op || pg.ops && pg.ops.length && pg.ops[pg.ops.length - 1];
        for (var i = 0; i < len; i++) {
            group = groupedOps[i];
            prevGroup = i > 0 ? groupedOps[i - 1] : null;
            prevOp = prevGroup && prevOpFn(prevGroup);
            if (this.shouldEndList(prevOp, group.op)) {
                endListTag();
            }

            if (group.op) {
                if (group.op.isContainerBlock()) {
                    if (this.shouldBeginList(prevOp, group.op)) {
                        beginListTag(this.getListTag(group.op));
                    }
                    html = callCustomRenderCb('beforeBlockRender', [group.op, group.ops]);
                    if (!html) {
                        html = this.renderContainerBlock(group.op, group.ops);
                        html = callCustomRenderCb('afterBlockRender', [html]);
                    }

                    htmlArr.push(html);

                } else { //  (video)
                    html = callCustomRenderCb('beforeBlockRender', [group.op]);
                    if (!html) {
                        html = this.converter.getHtml(group.op);
                        html = callCustomRenderCb('afterBlockRender', [html]);
                    }

                    htmlArr.push(html);
                }
            } else { // inline group
                html = callCustomRenderCb('beforeInlineGroupRender', [group.ops]);
                if (!html) {
                    html = this.renderInlines(group.ops);
                    html = callCustomRenderCb('afterInlineGroupRender', [html]);
                }
                htmlArr.push(html);
            }
        }
        // close any open list; 
        endListTag(true);
        return htmlArr.join('');
    }

    renderContainerBlock(op: DeltaInsertOp, ops: DeltaInsertOp[]) {

        var htmlParts = this.converter.getHtmlParts(op);
        
        if (op.isCodeBlock()) {
            return htmlParts.openingTag +
                ops.map((op) => op.insert.value).join('')
                + htmlParts.closingTag;
        }

        var inlines = this.renderInlines(ops, false);
        return htmlParts.openingTag + (inlines || BrTag) + htmlParts.closingTag;
    }

    renderInlines(ops: DeltaInsertOp[], wrapInParagraphTag = true) {
        var nlRx = /\n/g;
        var pStart = wrapInParagraphTag ? makeStartTag(this.options.paragraphTag) : '';
        var pEnd = wrapInParagraphTag ? makeEndTag(this.options.paragraphTag) : '';
        var opsLen = ops.length - 1;
        var html = pStart
            + ops.map((op: DeltaInsertOp, i: number) => {
                if ( i === opsLen && op.isJustNewline()) {
                    return '';
                }
                return this.converter.getHtml(op).replace(nlRx, BrTag)
            }).join('')
            + pEnd;
        return html;
    }

    shouldBeginList(prevOp: DeltaInsertOp, currOp: DeltaInsertOp) {
        if (!currOp) {
            return false;
        }
        // if previous one is not list but current one is, then yes
        if ((!prevOp || !prevOp.isList()) && currOp.isList()) {
            return true;
        }

        // if current and previou ones are lists that are diff
        if (prevOp && prevOp.isList() && currOp.isList() && !prevOp.isSameListAs(currOp)) {
            return true;
        }
        return false;
    }

    shouldEndList(prevOp: DeltaInsertOp, currOp: DeltaInsertOp) {

        // if previous one is a list but current one is not, then yes
        if (prevOp && prevOp.isList() && (!currOp || !currOp.isList())) {
            return true;
        }

        // if current and previou ones are lists that are not same 
        if (prevOp && prevOp.isList() && currOp && currOp.isList() && !prevOp.isSameListAs(currOp)) {
            return true;
        }
        return false;
    }

    beforeBlockRender(cb: (op: DeltaInsertOp, ops: DeltaInsertOp[] | null) => string) {
        if (typeof cb === 'function') {
            this.callbacks['beforeBlockRender_cb'] = cb;
        }
    }
    
    beforeInlineGroupRender(cb: (ops: DeltaInsertOp[]) => string) {
        if (typeof cb === 'function') {
            this.callbacks['beforeInlineGroupRender_cb'] = cb;
        }
    }

    afterBlockRender(cb: (html: string) => string) {
        if (typeof cb === 'function') {
            this.callbacks['afterBlockRender_cb'] = cb;
        }
    }
   
    afterInlineGroupRender(cb: (html: string) => string) {
        if (typeof cb === 'function') {
            this.callbacks['afterInlineGroupRender_cb'] = cb;
        }
    }

}

export { QuillDeltaToHtmlConverter };
