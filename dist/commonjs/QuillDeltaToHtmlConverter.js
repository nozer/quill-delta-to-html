"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InsertOpsConverter_1 = require("./InsertOpsConverter");
var OpToHtmlConverter_1 = require("./OpToHtmlConverter");
var OpGroup_1 = require("./OpGroup");
var funcs_html_1 = require("./funcs-html");
var funcs_misc_1 = require("./funcs-misc");
var value_types_1 = require("./value-types");
var BrTag = '<br/>';
var QuillDeltaToHtmlConverter = (function () {
    function QuillDeltaToHtmlConverter(deltaOps, options) {
        this.rawDeltaOps = [];
        this.callbacks = {};
        this.options = funcs_misc_1.assign({
            orderedListTag: 'ol',
            bulletListTag: 'ul',
            paragraphTag: 'p',
            makeParagraphPerLine: true,
            encodeHtml: true,
            classPrefix: 'ql'
        }, options);
        this.converter = new OpToHtmlConverter_1.OpToHtmlConverter({
            encodeHtml: this.options.encodeHtml,
            classPrefix: this.options.classPrefix
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
        var groupedOps = OpGroup_1.OpGroup.groupOps(deltaOps);
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
            if (group.op && group.op.isContainerBlock()) {
                if (this.shouldBeginList(prevOp, group.op)) {
                    beginListTag(this.getListTag(group.op));
                }
                html = callCustomRenderCb('beforeContainerBlockRender', [group.op, group.ops]);
                if (!html) {
                    html = this.renderContainerBlock(group.op, group.ops);
                    html = callCustomRenderCb('afterContainerBlockRender', [html]);
                }
                htmlArr.push(html);
            }
            else if (group.op && group.op.isDataBlock()) {
                html = callCustomRenderCb('beforeDataBlockRender', [group.op]);
                if (!html) {
                    html = this.converter.getHtml(group.op);
                    html = callCustomRenderCb('afterDataBlockRender', [html]);
                }
                htmlArr.push(html);
            }
            else if (!group.op && group.ops) {
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
                ops.map(function (op) { return op.insert.value; }).join(value_types_1.NewLine)
                + htmlParts.closingTag;
        }
        var inlines = this.renderInlines(ops, true);
        return htmlParts.openingTag + (inlines || BrTag) + htmlParts.closingTag;
    };
    QuillDeltaToHtmlConverter.prototype.renderInlines = function (ops, renderingWithinBlock) {
        if (renderingWithinBlock === void 0) { renderingWithinBlock = false; }
        var nlRx = /\n/g;
        var pStart, pEnd;
        var pStartOuter = pStart = funcs_html_1.makeStartTag(this.options.paragraphTag);
        var pEndOuter = pEnd = funcs_html_1.makeEndTag(this.options.paragraphTag);
        if (!this.options.makeParagraphPerLine || renderingWithinBlock) {
            pStart = '';
            pEnd = '';
        }
        if (renderingWithinBlock) {
            pStartOuter = '';
            pEndOuter = '';
        }
        var lastIndex = ops.length - 1;
        var replaced_html, html, isPrevNl, isNextNl;
        return ops.reduce(function (result, op, i) {
            html = this.converter.getHtml(op);
            if (!op.isJustNewline()) {
                result.push(html);
                return result;
            }
            replaced_html = html.replace(nlRx, BrTag);
            if (0 === lastIndex) {
                result.push(replaced_html);
                return result;
            }
            var endStart = pEnd + pStart;
            if (i === 0) {
                result.push(replaced_html + endStart);
            }
            else if (i < lastIndex) {
                isPrevNl = ops[i - 1].isJustNewline();
                isNextNl = ops[i + 1].isJustNewline();
                if (!isPrevNl && !isNextNl) {
                    result.push(endStart || BrTag);
                }
                else if (isNextNl) {
                    result.push(endStart + replaced_html);
                }
                else if (isPrevNl) {
                    result.push(endStart || BrTag);
                }
            }
            return result;
        }.bind(this), [pStartOuter]).concat(pEndOuter).join('');
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
    QuillDeltaToHtmlConverter.prototype.beforeContainerBlockRender = function (cb) {
        if (typeof cb === 'function') {
            this.callbacks['beforeContainerBlockRender_cb'] = cb;
        }
    };
    QuillDeltaToHtmlConverter.prototype.beforeDataBlockRender = function (cb) {
        if (typeof cb === 'function') {
            this.callbacks['beforeDataBlockRender_cb'] = cb;
        }
    };
    QuillDeltaToHtmlConverter.prototype.beforeInlineGroupRender = function (cb) {
        if (typeof cb === 'function') {
            this.callbacks['beforeInlineGroupRender_cb'] = cb;
        }
    };
    QuillDeltaToHtmlConverter.prototype.afterContainerBlockRender = function (cb) {
        if (typeof cb === 'function') {
            this.callbacks['afterContainerBlockRender_cb'] = cb;
        }
    };
    QuillDeltaToHtmlConverter.prototype.afterDataBlockRender = function (cb) {
        if (typeof cb === 'function') {
            this.callbacks['afterDataBlockRender_cb'] = cb;
        }
    };
    QuillDeltaToHtmlConverter.prototype.afterInlineGroupRender = function (cb) {
        if (typeof cb === 'function') {
            this.callbacks['afterInlineGroupRender_cb'] = cb;
        }
    };
    return QuillDeltaToHtmlConverter;
}());
exports.default = QuillDeltaToHtmlConverter;
