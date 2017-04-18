(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.QuillDeltaToHtmlConverter = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var value_types_1 = require("./value-types");
var InsertData_1 = require("./InsertData");
var DeltaInsertOp = (function () {
    function DeltaInsertOp(insertVal, attributes) {
        if (!(insertVal instanceof InsertData_1.InsertData)) {
            insertVal = new InsertData_1.InsertData(value_types_1.DataType.Text, insertVal + '');
        }
        this.insert = insertVal;
        this.attributes = attributes || {};
    }
    DeltaInsertOp.prototype.isContainerBlock = function () {
        var attrs = this.attributes;
        return !!(attrs.blockquote || attrs.list || attrs['code-block'] ||
            attrs.header || attrs.align || attrs.direction || attrs.indent);
    };
    DeltaInsertOp.prototype.isDataBlock = function () {
        return this.isVideo();
    };
    DeltaInsertOp.prototype.isInline = function () {
        return !(this.isContainerBlock() || this.isDataBlock());
    };
    DeltaInsertOp.prototype.isCodeBlock = function () {
        return !!this.attributes['code-block'];
    };
    DeltaInsertOp.prototype.isJustNewline = function () {
        return this.insert.value === value_types_1.NewLine;
    };
    DeltaInsertOp.prototype.isList = function () {
        return this.isOrderedList() || this.isBulletList();
    };
    DeltaInsertOp.prototype.isOrderedList = function () {
        return this.attributes.list === value_types_1.ListType.Ordered;
    };
    DeltaInsertOp.prototype.isBulletList = function () {
        return this.attributes.list === value_types_1.ListType.Bullet;
    };
    DeltaInsertOp.prototype.isSameListAs = function (op) {
        return this.attributes.list === op.attributes.list;
    };
    DeltaInsertOp.prototype.isText = function () {
        return this.insert.type === value_types_1.DataType.Text;
    };
    DeltaInsertOp.prototype.isImage = function () {
        return this.insert.type === value_types_1.DataType.Image;
    };
    DeltaInsertOp.prototype.isFormula = function () {
        return this.insert.type === value_types_1.DataType.Formula;
    };
    DeltaInsertOp.prototype.isVideo = function () {
        return this.insert.type === value_types_1.DataType.Video;
    };
    DeltaInsertOp.prototype.isLink = function () {
        return this.isText() && !!this.attributes.link;
    };
    return DeltaInsertOp;
}());
exports.DeltaInsertOp = DeltaInsertOp;

},{"./InsertData":2,"./value-types":11}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InsertData = (function () {
    function InsertData(type, value) {
        this.type = type;
        this.value = value + '';
    }
    return InsertData;
}());
exports.InsertData = InsertData;
;

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var value_types_1 = require("./value-types");
var funcs_misc_1 = require("./funcs-misc");
var InsertOpDenormalizer = (function () {
    function InsertOpDenormalizer() {
    }
    InsertOpDenormalizer.denormalize = function (op) {
        if (!op || typeof op !== 'object') {
            return [];
        }
        if (typeof op.insert === 'object' || op.insert === value_types_1.NewLine) {
            return [op];
        }
        var newlinedArray = funcs_misc_1.tokenizeWithNewLines(op.insert + '');
        if (newlinedArray.length === 1) {
            return [op];
        }
        var nlObj = funcs_misc_1.assign({}, op, { insert: value_types_1.NewLine });
        return newlinedArray.map(function (line) {
            if (line === value_types_1.NewLine) {
                return nlObj;
            }
            return funcs_misc_1.assign({}, op, {
                insert: line
            });
        });
    };
    return InsertOpDenormalizer;
}());
exports.InsertOpDenormalizer = InsertOpDenormalizer;

},{"./funcs-misc":10,"./value-types":11}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DeltaInsertOp_1 = require("./DeltaInsertOp");
var value_types_1 = require("./value-types");
var InsertData_1 = require("./InsertData");
var OpAttributeSanitizer_1 = require("./OpAttributeSanitizer");
var InsertOpDenormalizer_1 = require("./InsertOpDenormalizer");
var InsertOpsConverter = (function () {
    function InsertOpsConverter() {
    }
    InsertOpsConverter.convert = function (deltaOps) {
        if (!Array.isArray(deltaOps)) {
            return [];
        }
        var denormalizedOps = [].concat.apply([], deltaOps.map(InsertOpDenormalizer_1.InsertOpDenormalizer.denormalize));
        var results = [];
        var insertVal, attributes;
        for (var _i = 0, denormalizedOps_1 = denormalizedOps; _i < denormalizedOps_1.length; _i++) {
            var op = denormalizedOps_1[_i];
            if (!op || typeof op !== 'object' || !op.insert) {
                continue;
            }
            insertVal = InsertOpsConverter.convertInsertVal(op.insert);
            if (!insertVal) {
                continue;
            }
            attributes = OpAttributeSanitizer_1.OpAttributeSanitizer.sanitize(op.attributes);
            results.push(new DeltaInsertOp_1.DeltaInsertOp(insertVal, attributes));
        }
        return results;
    };
    InsertOpsConverter.convertInsertVal = function (insertPropVal) {
        if (typeof insertPropVal === 'string') {
            return new InsertData_1.InsertData(value_types_1.DataType.Text, insertPropVal);
        }
        if (!insertPropVal || typeof insertPropVal !== 'object') {
            return null;
        }
        return value_types_1.DataType.Image in insertPropVal ?
            new InsertData_1.InsertData(value_types_1.DataType.Image, insertPropVal[value_types_1.DataType.Image])
            : value_types_1.DataType.Video in insertPropVal ?
                new InsertData_1.InsertData(value_types_1.DataType.Video, insertPropVal[value_types_1.DataType.Video])
                : value_types_1.DataType.Formula in insertPropVal ?
                    new InsertData_1.InsertData(value_types_1.DataType.Formula, insertPropVal[value_types_1.DataType.Formula])
                    : null;
    };
    return InsertOpsConverter;
}());
exports.InsertOpsConverter = InsertOpsConverter;

},{"./DeltaInsertOp":1,"./InsertData":2,"./InsertOpDenormalizer":3,"./OpAttributeSanitizer":5,"./value-types":11}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var value_types_1 = require("./value-types");
var funcs_misc_1 = require("./funcs-misc");
var OpAttributeSanitizer = (function () {
    function OpAttributeSanitizer() {
    }
    OpAttributeSanitizer.sanitize = function (dirtyAttrs) {
        var cleanAttrs = {};
        if (!dirtyAttrs || typeof dirtyAttrs !== 'object') {
            return cleanAttrs;
        }
        var font = dirtyAttrs.font, size = dirtyAttrs.size, link = dirtyAttrs.link, script = dirtyAttrs.script, list = dirtyAttrs.list, header = dirtyAttrs.header, align = dirtyAttrs.align, direction = dirtyAttrs.direction, indent = dirtyAttrs.indent;
        ['bold', 'italic', 'underline', 'strike', 'code', 'blockquote', 'code-block']
            .forEach(function (prop) {
            cleanAttrs[prop] = !!dirtyAttrs[prop];
        });
        ['background', 'color'].forEach(function (prop) {
            var val = dirtyAttrs[prop];
            if (val && OpAttributeSanitizer.IsValidHexColor(val + '')) {
                cleanAttrs[prop] = val;
            }
        });
        if (font && OpAttributeSanitizer.IsValidFontName(font + '')) {
            cleanAttrs.font = font;
        }
        if (size && OpAttributeSanitizer.IsValidSize(size + '')) {
            cleanAttrs.size = size;
        }
        if (link) {
            cleanAttrs.link = funcs_misc_1.scrubUrl(link);
        }
        if (script === value_types_1.ScriptType.Sub || value_types_1.ScriptType.Super === script) {
            cleanAttrs.script = script;
        }
        if (list === value_types_1.ListType.Bullet || list === value_types_1.ListType.Ordered) {
            cleanAttrs.list = list;
        }
        if (header && parseInt(header + '', 10) > 0) {
            cleanAttrs.header = Math.min(parseInt(header + '', 10), 6);
        }
        if (align === value_types_1.AlignType.Center || align === value_types_1.AlignType.Right) {
            cleanAttrs.align = align;
        }
        if (direction === value_types_1.DirectionType.Rtl) {
            cleanAttrs.direction = direction;
        }
        if (indent && parseInt(indent + '', 10) > 0) {
            cleanAttrs.indent = Math.min(parseInt(indent + '', 10), 30);
        }
        return cleanAttrs;
    };
    OpAttributeSanitizer.IsValidHexColor = function (colorStr) {
        return !!colorStr.match(/^#([0-9A-F]{6}|[0-9A-F]{3})$/i);
    };
    OpAttributeSanitizer.IsValidFontName = function (fontName) {
        return !!fontName.match(/^[a-z\s0-9\- ]{1,30}$/i);
    };
    OpAttributeSanitizer.IsValidSize = function (size) {
        return !!size.match(/^[a-z\-]{1,20}$/i);
    };
    return OpAttributeSanitizer;
}());
exports.OpAttributeSanitizer = OpAttributeSanitizer;

},{"./funcs-misc":10,"./value-types":11}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var funcs_misc_1 = require("./funcs-misc");
;
;
var OpGroup = (function () {
    function OpGroup(op, ops) {
        if (op === void 0) { op = null; }
        if (ops === void 0) { ops = null; }
        this.op = op;
        this.ops = ops;
    }
    OpGroup.getOpsSequenceWhile = function (startIndex, ops, predicate) {
        var result = {
            ops: [],
            lastUnprocessedIndex: startIndex
        };
        for (var i = startIndex - 1; i >= 0; i--) {
            var op = ops[i];
            if (!predicate(op)) {
                break;
            }
            result.lastUnprocessedIndex = i;
            result.ops.push(op);
        }
        result.ops.reverse();
        return result;
    };
    OpGroup.groupOps = function (ops) {
        var result = [];
        var canBeInBlock = function (op) {
            return !(op.isJustNewline() || op.isDataBlock() || op.isContainerBlock());
        };
        var isInlineData = function (op) { return op.isInline(); };
        var lastInd = ops.length - 1;
        var opsResult;
        for (var i = lastInd; i >= 0; i--) {
            var op = ops[i];
            if (op.isDataBlock()) {
                result.push(new OpGroup(op));
            }
            else if (op.isContainerBlock()) {
                opsResult = OpGroup.getOpsSequenceWhile(i, ops, canBeInBlock);
                result.push(new OpGroup(op, opsResult.ops));
                i = opsResult.lastUnprocessedIndex;
            }
            else {
                opsResult = OpGroup.getOpsSequenceWhile(i, ops, isInlineData);
                result.push(new OpGroup(null, opsResult.ops.concat(op)));
                i = opsResult.lastUnprocessedIndex;
            }
        }
        result.reverse();
        return OpGroup.moveConsecutiveCodeblockOpsToFirstGroup(result);
    };
    OpGroup.moveConsecutiveCodeblockOpsToFirstGroup = function (groups) {
        var codeblocksGrouped = funcs_misc_1.groupConsecutiveElementsWhile(groups, function (g) {
            return g.op && g.op.isCodeBlock();
        });
        return codeblocksGrouped.map(function (elm) {
            if (!Array.isArray(elm)) {
                return elm;
            }
            elm[0].ops = funcs_misc_1.flattenArray(elm.map(function (g) { return g.ops; }));
            return elm[0];
        });
    };
    return OpGroup;
}());
exports.OpGroup = OpGroup;

},{"./funcs-misc":10}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var funcs_html_1 = require("./funcs-html");
var value_types_1 = require("./value-types");
var funcs_misc_1 = require("./funcs-misc");
var OpToHtmlConverter = (function () {
    function OpToHtmlConverter(options) {
        this.options = funcs_misc_1.assign({}, {
            classPrefix: 'ql',
            encodeHtml: true,
        }, options);
    }
    OpToHtmlConverter.prototype.prefixClass = function (className) {
        if (!this.options.classPrefix) {
            return className + '';
        }
        return this.options.classPrefix + '-' + className;
    };
    OpToHtmlConverter.prototype.getHtml = function (op) {
        var parts = this.getHtmlParts(op);
        return parts.openingTag + parts.content + parts.closingTag;
    };
    OpToHtmlConverter.prototype.getHtmlParts = function (op) {
        if (op.isJustNewline() && !op.isContainerBlock()) {
            return { openingTag: '', closingTag: '', content: value_types_1.NewLine };
        }
        var tags = this.getTags(op), attrs = this.getTagAttributes(op);
        if (!tags.length && attrs.length) {
            tags.push('span');
        }
        var beginTags = [], endTags = [];
        for (var _i = 0, tags_1 = tags; _i < tags_1.length; _i++) {
            var tag = tags_1[_i];
            beginTags.push(funcs_html_1.makeStartTag(tag, attrs));
            endTags.push(tag === 'img' ? '' : funcs_html_1.makeEndTag(tag));
            attrs = null;
        }
        endTags.reverse();
        return {
            openingTag: beginTags.join(''),
            content: this.getContent(op),
            closingTag: endTags.join('')
        };
    };
    OpToHtmlConverter.prototype.getContent = function (op) {
        if (op.isContainerBlock()) {
            return '';
        }
        var content = op.isFormula() || op.isText() ? op.insert.value : '';
        return this.options.encodeHtml && funcs_html_1.encodeHtml(content) || content;
    };
    OpToHtmlConverter.prototype.getCssClasses = function (op) {
        var attrs = op.attributes;
        return ['indent', 'align', 'direction', 'font', 'size']
            .filter(function (prop) { return !!attrs[prop]; })
            .map(function (prop) { return prop + '-' + attrs[prop]; })
            .concat(op.isFormula() ? 'formula' : [])
            .concat(op.isVideo() ? 'video' : [])
            .concat(op.isImage() ? 'image' : [])
            .map(this.prefixClass.bind(this));
    };
    OpToHtmlConverter.prototype.getCssStyles = function (op) {
        var attrs = op.attributes;
        return [['background', 'background-color'], ['color']]
            .filter(function (item) { return !!attrs[item[0]]; })
            .map(function (item) { return funcs_misc_1.preferSecond(item) + ':' + attrs[item[0]]; });
    };
    OpToHtmlConverter.prototype.getTagAttributes = function (op) {
        if (op.attributes.code) {
            return [];
        }
        var makeAttr = function (k, v) { return ({ key: k, value: v }); };
        var classes = this.getCssClasses(op);
        var tagAttrs = classes.length ? [makeAttr('class', classes.join(' '))] : [];
        if (op.isImage()) {
            return tagAttrs.concat(makeAttr('src', funcs_misc_1.scrubUrl(op.insert.value)));
        }
        if (op.isFormula() || op.isContainerBlock()) {
            return tagAttrs;
        }
        if (op.isVideo()) {
            return tagAttrs.concat(makeAttr('frameborder', '0'), makeAttr('allowfullscreen', 'true'), makeAttr('src', funcs_misc_1.scrubUrl(op.insert.value)));
        }
        var styles = this.getCssStyles(op);
        var styleAttr = styles.length ? [makeAttr('style', styles.join(';'))] : [];
        return tagAttrs
            .concat(styleAttr)
            .concat(op.isLink() ? makeAttr('href', op.attributes.link) : []);
    };
    OpToHtmlConverter.prototype.getTags = function (op) {
        var attrs = op.attributes;
        if (attrs.code) {
            return ['code'];
        }
        if (!op.isText()) {
            return [op.isVideo() ? 'iframe'
                    : op.isImage() ? 'img'
                        : op.isFormula() ? 'span'
                            : 'unknown'
            ];
        }
        var blocks = [['blockquote'], ['code-block', 'pre'], ['list', 'li'], ['header'],
            ['align', 'p'], ['direction', 'p'], ['indent', 'p']];
        for (var _i = 0, blocks_1 = blocks; _i < blocks_1.length; _i++) {
            var item = blocks_1[_i];
            if (attrs[item[0]]) {
                return item[0] === 'header' ? ['h' + attrs[item[0]]] : [funcs_misc_1.preferSecond(item)];
            }
        }
        return [['link', 'a'], ['script'],
            ['bold', 'strong'], ['italic', 'em'], ['strike', 's'], ['underline', 'u']
        ]
            .filter(function (item) { return !!attrs[item[0]]; })
            .map(function (item) {
            return item[0] === 'script' ?
                (attrs[item[0]] === value_types_1.ScriptType.Sub ? 'sub' : 'sup')
                : funcs_misc_1.preferSecond(item);
        });
    };
    return OpToHtmlConverter;
}());
exports.OpToHtmlConverter = OpToHtmlConverter;

},{"./funcs-html":9,"./funcs-misc":10,"./value-types":11}],8:[function(require,module,exports){
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
exports.QuillDeltaToHtmlConverter = QuillDeltaToHtmlConverter;

},{"./InsertOpsConverter":4,"./OpGroup":6,"./OpToHtmlConverter":7,"./funcs-html":9,"./funcs-misc":10,"./value-types":11}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function makeStartTag(tag, attrs) {
    if (attrs === void 0) { attrs = null; }
    if (!tag) {
        return '';
    }
    if (attrs) {
        attrs = [].concat(attrs);
    }
    var attrsStr = attrs &&
        attrs.map(function (attr) {
            return attr.key + (attr.value ? '="' + attr.value + '"' : '');
        }).join(' ');
    var closing = '>';
    if (tag === 'img' || tag === 'br') {
        closing = '/>';
    }
    return attrsStr ? "<" + tag + " " + attrsStr + closing : "<" + tag + closing;
}
exports.makeStartTag = makeStartTag;
function makeEndTag(tag) {
    if (tag === void 0) { tag = ''; }
    return tag && "</" + tag + ">" || '';
}
exports.makeEndTag = makeEndTag;
function decodeHtml(str) {
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/');
}
exports.decodeHtml = decodeHtml;
function encodeHtml(str, preventDoubleEncoding) {
    if (preventDoubleEncoding === void 0) { preventDoubleEncoding = true; }
    if (preventDoubleEncoding) {
        str = decodeHtml(str);
    }
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");
}
exports.encodeHtml = encodeHtml;

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function flattenArray(arr) {
    if (!Array.isArray(arr)) {
        return arr;
    }
    return arr.reduce(function (pv, v) { return pv.concat(flattenArray(v)); }, []);
}
exports.flattenArray = flattenArray;
function preferSecond(arg) {
    if (!Array.isArray(arg) || arg.length === 0) {
        return null;
    }
    return arg.length >= 2 ? arg[1] : arg[0];
}
exports.preferSecond = preferSecond;
function tokenizeWithNewLines(str, newLine) {
    if (newLine === void 0) { newLine = "\n"; }
    if (typeof str !== 'string' || str === newLine) {
        return [str];
    }
    var lines = str.split(newLine);
    if (lines.length === 1) {
        return lines;
    }
    var lastIndex = lines.length - 1;
    return lines.reduce(function (pv, line, ind) {
        if (ind !== lastIndex) {
            if (line !== "") {
                pv = pv.concat(line, newLine);
            }
            else {
                pv.push(newLine);
            }
        }
        else if (line !== "") {
            pv.push(line);
        }
        return pv;
    }, []);
}
exports.tokenizeWithNewLines = tokenizeWithNewLines;
function scrubUrl(url) {
    return url.replace(/[^-A-Za-z0-9+&@#/%?=~_|!:,.;\(\)]/g, '');
}
exports.scrubUrl = scrubUrl;
function assign(target, varArg1, varArg2) {
    'use strict';
    if (varArg2 === void 0) { varArg2 = null; }
    if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
    }
    var to = Object(target);
    for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];
        if (nextSource != null) {
            for (var nextKey in nextSource) {
                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                    to[nextKey] = nextSource[nextKey];
                }
            }
        }
    }
    return to;
}
exports.assign = assign;
;
function groupConsecutiveElementsWhile(arr, predicate) {
    var groups = [];
    var groupedElementIndexes = [];
    var isConsecutive = function (index) {
        return groupedElementIndexes.length
            && (groupedElementIndexes[groupedElementIndexes.length - 1] + 1) === index;
    };
    for (var i = 0; i < arr.length; i++) {
        if (predicate(arr[i])) {
            if (!isConsecutive(i)) {
                groups.push([]);
            }
            var g = groups[groups.length - 1];
            g.push(arr[i]);
            groupedElementIndexes.push(i);
        }
        else {
            groups.push(arr[i]);
        }
    }
    return groups;
}
exports.groupConsecutiveElementsWhile = groupConsecutiveElementsWhile;

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NewLine = "\n";
exports.NewLine = NewLine;
var ListType = {
    Ordered: 'ordered',
    Bullet: 'bullet'
};
exports.ListType = ListType;
var ScriptType = {
    Sub: "sub",
    Super: "super"
};
exports.ScriptType = ScriptType;
var DirectionType = {
    Rtl: "rtl"
};
exports.DirectionType = DirectionType;
var AlignType = {
    Center: "center",
    Right: "right"
};
exports.AlignType = AlignType;
var DataType = {
    Image: "image",
    Video: "video",
    Formula: "formula",
    Text: "text"
};
exports.DataType = DataType;

},{}]},{},[8])(8)
});; window.QuillDeltaToHtmlConverter = window.QuillDeltaToHtmlConverter.QuillDeltaToHtmlConverter; 
