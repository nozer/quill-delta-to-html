
import { flattenArray, tokenizeWithNewLines } from './funcs-misc';
import { NewLine } from './value-types';
import { InsertOpsConverter } from './InsertOpsConverter';
import { OpToHtmlConverter, IOpToHtmlConverterOptions } from './OpToHtmlConverter';
import { makeStartTag, makeEndTag } from './funcs-html';
import { Embed, EmbedType } from './Embed';
import { DeltaInsertOp } from './DeltaInsertOp';
import { OpGroup } from './OpGroup';


interface IQuillDeltaToHtmlConverterOptions {
    classPrefix?: string,
    orderedListTag?: string,
    bulletListTag?: string,
    paragraphTag?: string,
    encodeHtml?: boolean
}

class QuillDeltaToHtmlConverter {
    private options: IQuillDeltaToHtmlConverterOptions;
    private rawDeltaOps: any[] = [];
    private converterOptions: IOpToHtmlConverterOptions;

    constructor(deltaOps: any[], options?: IQuillDeltaToHtmlConverterOptions) {

        this.options = Object.assign({
            classPrefix: 'ql',
            orderedListTag: 'ol',
            bulletListTag: 'ul',
            paragraphTag: 'p',
            encodeHtml: true
        }, options);

        this.converterOptions = {
            classPrefix: this.options.classPrefix,
            encodeHtml: this.options.encodeHtml,
            paragraphTag: this.options.paragraphTag
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

        var groupedOps = OpGroup.groupOps(deltaOps);
        var len = groupedOps.length;
        var group, prevGroup, html;
        for (var i = 0; i < len; i++) {
            group = groupedOps[i];
            prevGroup = i > 0 ? groupedOps[i - 1] : null;
            if (prevGroup && this.shouldEndList(prevGroup.op, group.op)) {
                endListTag();
            }

            if (group.op && group.op.isContainerBlock()) {
                if (this.shouldBeginList(prevGroup.op, group.op)) {
                    beginListTag(this.getListTag(group.op));
                }
                html = this.renderContainerBlock(group.op, group.ops);
                htmlArr.push(html);

            } else if (group.op && group.op.isDataBlock()) {
                html = this.renderDataBlock(group.op);
                htmlArr.push(html);

            } else if (!group.op && group.ops) {
                html = this.renderInlineGroup(group.ops);
                htmlArr.push(html);
            }
        }
        // close any open list; 
        endListTag(true);
        return htmlArr.join('');
    }

    renderContainerBlock(op: DeltaInsertOp, ops: DeltaInsertOp[]) {

        var opConverter = new OpToHtmlConverter(op, this.converterOptions);

        var htmlParts = opConverter.getHtmlParts();

        return htmlParts.opening
            + this.renderInlines(ops)
            + htmlParts.closing;
    }

    renderDataBlock(op: DeltaInsertOp) {

        var opConverter = new OpToHtmlConverter(op, this.converterOptions);
        return opConverter.getHtml();
    }

    renderInlineGroup(ops: DeltaInsertOp[]) {
        return makeStartTag(this.options.paragraphTag)
            + this.renderInlines(ops)
            + makeEndTag(this.options.paragraphTag);
    }

    renderInlines(ops: DeltaInsertOp[]): string {
        
        return ops.reduce(function (arr: Array<string>, op: DeltaInsertOp) {
            var opConverter = new OpToHtmlConverter(op, this.converterOptions);
            arr.push(opConverter.getHtml());
            return arr;
        }.bind(this), [])
            .join('');
    }

    // callback(blockOp, ops)
    beforeContainerBlockRender(callback: any) {

    }

    // callback(op)
    beforeDataBlockRender(callback: any) {

    }

    // callback(ops)
    beforeInlineGroupRender(callback: any) {

    }

    shouldBeginList(prevOp: DeltaInsertOp, currOp: DeltaInsertOp) {

        // if previous one is not list but current one is, then yes
        if (!prevOp.isList() && currOp.isList()) {
            return true;
        }

        // if current and previou ones are lists
        if (prevOp.isList() && currOp.isList()) {

            // if they are not the same type, then yes
            if (!prevOp.isSameListAs(currOp)) {
                return true;
                // if they are same type and if the current one is indented, yes 
            } else if (prevOp.attributes.indent < currOp.attributes.indent) {
                return true;
            }
        }
        return false;
    }

    shouldEndList(prevOp: DeltaInsertOp, currOp: DeltaInsertOp) {

        // if previous one is a list but current one is not, then yes
        if (prevOp.isList() && !currOp.isList()) {
            return true;
        }

        // if current and previou ones are lists
        if (prevOp.isList() && currOp.isList()) {

            // if they are not the same type, then yes
            if (!prevOp.isSameListAs(currOp)) {
                return true;
                // if they are same type and if the current one is outdented, yes 
            } else if (currOp.attributes.indent < prevOp.attributes.indent) {
                return true;
            }
        }
        return false;
    }
}

export { QuillDeltaToHtmlConverter }