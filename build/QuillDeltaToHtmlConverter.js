"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InsertOpsConverter_1 = require("./InsertOpsConverter");
var OpToHtmlConverter_1 = require("./OpToHtmlConverter");
var funcs_html_1 = require("./funcs-html");
var OpGroup_1 = require("./OpGroup");
var QuillDeltaToHtmlConverter = (function () {
    function QuillDeltaToHtmlConverter(deltaOps, options) {
        this.options = Object.assign({
            classPrefix: 'ql',
            orderedListTag: 'ol',
            bulletListTag: 'ul',
            genericBlockTag: 'p',
            encodeHtml: true
        }, options);
        this.deltaOps = InsertOpsConverter_1.InsertOpsConverter.convert(deltaOps);
        this.converterOptions = {
            classPrefix: this.options.classPrefix,
            encodeHtml: this.options.encodeHtml
        };
    }
    QuillDeltaToHtmlConverter.prototype.getListTag = function (op) {
        return op.isOrderedList() ? this.options.orderedListTag + ''
            : op.isBulletList() ? this.options.bulletListTag + ''
                : '';
    };
    QuillDeltaToHtmlConverter.prototype.convert = function () {
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
        var groupedOps = OpGroup_1.OpGroup.groupDenormalizedOps(this.deltaOps);
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
            }
            else if (group.op && group.op.isDataBlock()) {
                html = this.renderDataBlock(group.op);
                htmlArr.push(html);
            }
            else if (!group.op && group.ops) {
                html = this.renderInlineGroup(group.ops);
                htmlArr.push(html);
            }
        }
        endListTag(true);
        return htmlArr.join('');
    };
    QuillDeltaToHtmlConverter.prototype.renderContainerBlock = function (op, ops) {
        var opConverter = new OpToHtmlConverter_1.OpToHtmlConverter(op, this.converterOptions);
        var htmlParts = opConverter.getHtmlParts();
        return htmlParts.opening
            + this.renderInlines(ops)
            + htmlParts.closing;
    };
    QuillDeltaToHtmlConverter.prototype.renderDataBlock = function (op) {
        var opConverter = new OpToHtmlConverter_1.OpToHtmlConverter(op, this.converterOptions);
        return opConverter.getHtml();
    };
    QuillDeltaToHtmlConverter.prototype.renderInlineGroup = function (ops) {
        return funcs_html_1.makeStartTag(this.options.genericBlockTag)
            + this.renderInlines(ops)
            + funcs_html_1.makeEndTag(this.options.genericBlockTag);
    };
    QuillDeltaToHtmlConverter.prototype.renderInlines = function (ops) {
        return ops.reduce(function (arr, op) {
            var opConverter = new OpToHtmlConverter_1.OpToHtmlConverter(op, this.converterOptions);
            arr.push(opConverter.getHtml());
            return arr;
        }.bind(this), [])
            .join('');
    };
    QuillDeltaToHtmlConverter.prototype.beforeContainerBlockRender = function (callback) {
    };
    QuillDeltaToHtmlConverter.prototype.beforeDataBlockRender = function (callback) {
    };
    QuillDeltaToHtmlConverter.prototype.beforeInlineGroupRender = function (callback) {
    };
    QuillDeltaToHtmlConverter.prototype.shouldBeginList = function (prevOp, currOp) {
        if (!prevOp.isList() && currOp.isList()) {
            return true;
        }
        if (prevOp.isList() && currOp.isList()) {
            if (!prevOp.isSameListAs(currOp)) {
                return true;
            }
            else if (prevOp.attributes.indent < currOp.attributes.indent) {
                return true;
            }
        }
        return false;
    };
    QuillDeltaToHtmlConverter.prototype.shouldEndList = function (prevOp, currOp) {
        if (prevOp.isList() && !currOp.isList()) {
            return true;
        }
        if (prevOp.isList() && currOp.isList()) {
            if (!prevOp.isSameListAs(currOp)) {
                return true;
            }
            else if (currOp.attributes.indent < prevOp.attributes.indent) {
                return true;
            }
        }
        return false;
    };
    return QuillDeltaToHtmlConverter;
}());
exports.QuillDeltaToHtmlConverter = QuillDeltaToHtmlConverter;
