"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InsertOpsConverter_1 = require("./InsertOpsConverter");
var OpToHtmlConverter_1 = require("./OpToHtmlConverter");
var OpGroup_1 = require("./OpGroup");
var funcs_html_1 = require("./funcs-html");
require("./extensions/Object");
var BrTag = '<br/>';
var QuillDeltaToHtmlConverter = (function () {
    function QuillDeltaToHtmlConverter(deltaOps, options) {
        this.rawDeltaOps = [];
        this.callbacks = {};
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
        this.converter = new OpToHtmlConverter_1.OpToHtmlConverter({
            encodeHtml: this.options.encodeHtml,
            classPrefix: this.options.classPrefix,
            listItemTag: this.options.listItemTag
        });
        this.rawDeltaOps = deltaOps;
    }
    QuillDeltaToHtmlConverter.prototype.getListTag = function (op) {
        return op.isOrderedList() ? this.options.orderedListTag + ''
            : op.isBulletList() ? this.options.bulletListTag + ''
                : '';
    };
    QuillDeltaToHtmlConverter.prototype.convert = function () {
        var deltaOps = InsertOpsConverter_1.InsertOpsConverter.convert(this.rawDeltaOps);
        var tagStack = [];
        var htmlArr = [];
        var beginListTag = function (tag) {
            tag && tagStack.push(tag) && htmlArr.push('<' + tag + '>');
        };
        var endListTag = function (shouldEndAllTags) {
            if (shouldEndAllTags === void 0) { shouldEndAllTags = false; }
            var endTag = function () {
                var tag = tagStack.pop();
                tag && htmlArr.push('</' + tag + '>');
            };
            shouldEndAllTags ? tagStack.map(endTag) : endTag();
        };
        var callCustomRenderCb = function (cbName, args) {
            cbName += '_cb';
            if (typeof this.callbacks[cbName] === 'function') {
                return this.callbacks[cbName].apply(null, args);
            }
            return cbName.indexOf('after') === 0 ? args[0] : undefined;
        }.bind(this);
        var pairedOps = OpGroup_1.OpGroup.pairOpsWithTheirBlock(deltaOps);
        var groupedSameStyleBlocks = OpGroup_1.OpGroup.groupConsecutiveSameStyleBlocks(pairedOps, {
            blockquotes: !!this.options.multiLineBlockquote,
            header: !!this.options.multiLineHeader,
            codeBlocks: !!this.options.multiLineCodeblock
        });
        var groupedOps = OpGroup_1.OpGroup.reduceConsecutiveSameStyleBlocksToOne(groupedSameStyleBlocks);
        var len = groupedOps.length;
        var group, prevGroup, html, prevOp;
        var prevOpFn = function (pg) { return pg.op || pg.ops && pg.ops.length && pg.ops[pg.ops.length - 1]; };
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
                }
                else {
                    html = callCustomRenderCb('beforeBlockRender', [group.op]);
                    if (!html) {
                        html = this.converter.getHtml(group.op);
                        html = callCustomRenderCb('afterBlockRender', [html]);
                    }
                    htmlArr.push(html);
                }
            }
            else {
                html = callCustomRenderCb('beforeInlineGroupRender', [group.ops]);
                if (!html) {
                    html = this.renderInlines(group.ops);
                    html = callCustomRenderCb('afterInlineGroupRender', [html]);
                }
                htmlArr.push(html);
            }
        }
        endListTag(true);
        return htmlArr.join('');
    };
    QuillDeltaToHtmlConverter.prototype.renderContainerBlock = function (op, ops) {
        var htmlParts = this.converter.getHtmlParts(op);
        if (op.isCodeBlock()) {
            return htmlParts.openingTag +
                ops.map(function (op) { return op.insert.value; }).join('')
                + htmlParts.closingTag;
        }
        var inlines = this.renderInlines(ops, false);
        return htmlParts.openingTag + (inlines || BrTag) + htmlParts.closingTag;
    };
    QuillDeltaToHtmlConverter.prototype.renderInlines = function (ops, wrapInParagraphTag) {
        var _this = this;
        if (wrapInParagraphTag === void 0) { wrapInParagraphTag = true; }
        var nlRx = /\n/g;
        var pStart = wrapInParagraphTag ? funcs_html_1.makeStartTag(this.options.paragraphTag) : '';
        var pEnd = wrapInParagraphTag ? funcs_html_1.makeEndTag(this.options.paragraphTag) : '';
        var opsLen = ops.length - 1;
        var html = pStart
            + ops.map(function (op, i) {
                if (i === opsLen && op.isJustNewline()) {
                    return '';
                }
                return _this.converter.getHtml(op).replace(nlRx, BrTag);
            }).join('')
            + pEnd;
        return html;
    };
    QuillDeltaToHtmlConverter.prototype.shouldBeginList = function (prevOp, currOp) {
        if (!currOp) {
            return false;
        }
        if ((!prevOp || !prevOp.isList()) && currOp.isList()) {
            return true;
        }
        if (prevOp && prevOp.isList() && currOp.isList() && !prevOp.isSameListAs(currOp)) {
            return true;
        }
        return false;
    };
    QuillDeltaToHtmlConverter.prototype.shouldEndList = function (prevOp, currOp) {
        if (prevOp && prevOp.isList() && (!currOp || !currOp.isList())) {
            return true;
        }
        if (prevOp && prevOp.isList() && currOp && currOp.isList() && !prevOp.isSameListAs(currOp)) {
            return true;
        }
        return false;
    };
    QuillDeltaToHtmlConverter.prototype.beforeBlockRender = function (cb) {
        if (typeof cb === 'function') {
            this.callbacks['beforeBlockRender_cb'] = cb;
        }
    };
    QuillDeltaToHtmlConverter.prototype.beforeInlineGroupRender = function (cb) {
        if (typeof cb === 'function') {
            this.callbacks['beforeInlineGroupRender_cb'] = cb;
        }
    };
    QuillDeltaToHtmlConverter.prototype.afterBlockRender = function (cb) {
        if (typeof cb === 'function') {
            this.callbacks['afterBlockRender_cb'] = cb;
        }
    };
    QuillDeltaToHtmlConverter.prototype.afterInlineGroupRender = function (cb) {
        if (typeof cb === 'function') {
            this.callbacks['afterInlineGroupRender_cb'] = cb;
        }
    };
    return QuillDeltaToHtmlConverter;
}());
exports.QuillDeltaToHtmlConverter = QuillDeltaToHtmlConverter;
