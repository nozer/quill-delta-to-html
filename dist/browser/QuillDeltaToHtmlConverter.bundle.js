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
    DeltaInsertOp.createNewLineOp = function () {
        return new DeltaInsertOp(value_types_1.NewLine);
    };
    DeltaInsertOp.prototype.isContainerBlock = function () {
        var attrs = this.attributes;
        return !!(attrs.blockquote || attrs.list || attrs['code-block'] ||
            attrs.header || attrs.align || attrs.direction || attrs.indent);
    };
    DeltaInsertOp.prototype.isBlockquote = function () {
        return this.attributes.blockquote;
    };
    DeltaInsertOp.prototype.isHeader = function () {
        return !!this.attributes.header;
    };
    DeltaInsertOp.prototype.isSameHeaderAs = function (op) {
        return op.attributes.header === this.attributes.header && this.isHeader();
    };
    DeltaInsertOp.prototype.hasSameAdiAs = function (op) {
        return this.attributes.align === op.attributes.align
            && this.attributes.direction === op.attributes.direction
            && this.attributes.indent === op.attributes.indent;
    };
    DeltaInsertOp.prototype.isInline = function () {
        return !(this.isContainerBlock() || this.isVideo());
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
        return this.attributes.list === op.attributes.list && !!op.attributes.list;
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

},{"./InsertData":2,"./value-types":13}],2:[function(require,module,exports){
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
require("./extensions/String");
require("./extensions/Object");
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
        var newlinedArray = (op.insert + '')._tokenizeWithNewLines();
        if (newlinedArray.length === 1) {
            return [op];
        }
        var nlObj = Object._assign({}, op, { insert: value_types_1.NewLine });
        return newlinedArray.map(function (line) {
            if (line === value_types_1.NewLine) {
                return nlObj;
            }
            return Object._assign({}, op, {
                insert: line
            });
        });
    };
    return InsertOpDenormalizer;
}());
exports.InsertOpDenormalizer = InsertOpDenormalizer;

},{"./extensions/Object":10,"./extensions/String":11,"./value-types":13}],4:[function(require,module,exports){
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
            if (!op.insert) {
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

},{"./DeltaInsertOp":1,"./InsertData":2,"./InsertOpDenormalizer":3,"./OpAttributeSanitizer":5,"./value-types":13}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var value_types_1 = require("./value-types");
require("./extensions/String");
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
            cleanAttrs.link = (link + '')._scrubUrl();
        }
        if (script === value_types_1.ScriptType.Sub || value_types_1.ScriptType.Super === script) {
            cleanAttrs.script = script;
        }
        if (list === value_types_1.ListType.Bullet || list === value_types_1.ListType.Ordered) {
            cleanAttrs.list = list;
        }
        if (header && Number(header)) {
            cleanAttrs.header = Math.min(Number(header), 6);
        }
        if (align === value_types_1.AlignType.Center || align === value_types_1.AlignType.Right) {
            cleanAttrs.align = align;
        }
        if (direction === value_types_1.DirectionType.Rtl) {
            cleanAttrs.direction = direction;
        }
        if (indent && Number(indent)) {
            cleanAttrs.indent = Math.min(Number(indent), 30);
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

},{"./extensions/String":11,"./value-types":13}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DeltaInsertOp_1 = require("./DeltaInsertOp");
require("./extensions/Array");
var OpGroup = (function () {
    function OpGroup(op, ops) {
        if (ops === void 0) { ops = null; }
        this.op = op;
        this.ops = ops;
    }
    OpGroup.pairOpsWithTheirBlock = function (ops) {
        var result = [];
        var canBeInBlock = function (op) {
            return !(op.isJustNewline() || op.isVideo() || op.isContainerBlock());
        };
        var isInlineData = function (op) { return op.isInline(); };
        var lastInd = ops.length - 1;
        var opsSlice;
        for (var i = lastInd; i >= 0; i--) {
            var op = ops[i];
            if (op.isVideo()) {
                result.push(new OpGroup(op));
            }
            else if (op.isContainerBlock()) {
                opsSlice = ops._sliceFromReverseWhile(i - 1, canBeInBlock);
                result.push(new OpGroup(op, opsSlice.elements));
                i = opsSlice.sliceStartsAt > -1 ? opsSlice.sliceStartsAt : i;
            }
            else {
                opsSlice = ops._sliceFromReverseWhile(i - 1, isInlineData);
                result.push(new OpGroup(null, opsSlice.elements.concat(op)));
                i = opsSlice.sliceStartsAt > -1 ? opsSlice.sliceStartsAt : i;
            }
        }
        result.reverse();
        return result;
    };
    OpGroup.groupConsecutiveSameStyleBlocks = function (groups, blocksOf) {
        if (blocksOf === void 0) { blocksOf = {
            header: true,
            codeBlocks: true,
            blockquotes: true
        }; }
        return groups._groupConsecutiveElementsWhile(function (g, gPrev) {
            return blocksOf.codeBlocks && OpGroup.areBothCodeblocks(g, gPrev)
                || blocksOf.blockquotes && OpGroup.areBothBlockquotesWithSameAdi(g, gPrev)
                || blocksOf.header && OpGroup.areBothSameHeadersWithSameAdi(g, gPrev);
        });
    };
    OpGroup.reduceConsecutiveSameStyleBlocksToOne = function (groups) {
        var newLineOp = DeltaInsertOp_1.DeltaInsertOp.createNewLineOp();
        return groups.map(function (elm) {
            if (!Array.isArray(elm)) {
                return elm;
            }
            var groupsLastInd = elm.length - 1;
            elm[0].ops = elm.map(function (g, i) {
                if (!g.ops.length) {
                    return [newLineOp];
                }
                return g.ops.concat(i < groupsLastInd ? [newLineOp] : []);
            })._flatten();
            return elm[0];
        });
    };
    OpGroup.areBothCodeblocks = function (g1, gOther) {
        return g1.op && gOther.op && g1.op.isCodeBlock() && gOther.op.isCodeBlock();
    };
    OpGroup.areBothSameHeadersWithSameAdi = function (g1, gOther) {
        return g1.op && gOther.op && g1.op.isSameHeaderAs(gOther.op)
            && g1.op.hasSameAdiAs(gOther.op);
    };
    OpGroup.areBothBlockquotesWithSameAdi = function (g, gOther) {
        return g.op && gOther.op && g.op.isBlockquote() && gOther.op.isBlockquote()
            && g.op.hasSameAdiAs(gOther.op);
    };
    return OpGroup;
}());
exports.OpGroup = OpGroup;

},{"./DeltaInsertOp":1,"./extensions/Array":9}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var funcs_html_1 = require("./funcs-html");
var value_types_1 = require("./value-types");
require("./extensions/String");
require("./extensions/Object");
require("./extensions/Array");
var OpToHtmlConverter = (function () {
    function OpToHtmlConverter(options) {
        this.options = Object._assign({}, {
            classPrefix: 'ql',
            encodeHtml: true,
            listItemTag: 'li'
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
            .map(function (item) { return item._preferSecond() + ':' + attrs[item[0]]; });
    };
    OpToHtmlConverter.prototype.getTagAttributes = function (op) {
        if (op.attributes.code) {
            return [];
        }
        var makeAttr = function (k, v) { return ({ key: k, value: v }); };
        var classes = this.getCssClasses(op);
        var tagAttrs = classes.length ? [makeAttr('class', classes.join(' '))] : [];
        if (op.isImage()) {
            return tagAttrs.concat(makeAttr('src', (op.insert.value + '')._scrubUrl()));
        }
        if (op.isFormula() || op.isContainerBlock()) {
            return tagAttrs;
        }
        if (op.isVideo()) {
            return tagAttrs.concat(makeAttr('frameborder', '0'), makeAttr('allowfullscreen', 'true'), makeAttr('src', (op.insert.value + '')._scrubUrl()));
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
        var blocks = [['blockquote'], ['code-block', 'pre'],
            ['list', this.options.listItemTag], ['header'],
            ['align', 'p'], ['direction', 'p'], ['indent', 'p']];
        for (var _i = 0, blocks_1 = blocks; _i < blocks_1.length; _i++) {
            var item = blocks_1[_i];
            if (attrs[item[0]]) {
                return item[0] === 'header' ? ['h' + attrs[item[0]]] : [item._preferSecond()];
            }
        }
        return [['link', 'a'], ['script'],
            ['bold', 'strong'], ['italic', 'em'], ['strike', 's'], ['underline', 'u']
        ]
            .filter(function (item) { return !!attrs[item[0]]; })
            .map(function (item) {
            return item[0] === 'script' ?
                (attrs[item[0]] === value_types_1.ScriptType.Sub ? 'sub' : 'sup')
                : item._preferSecond();
        });
    };
    return OpToHtmlConverter;
}());
exports.OpToHtmlConverter = OpToHtmlConverter;

},{"./extensions/Array":9,"./extensions/Object":10,"./extensions/String":11,"./funcs-html":12,"./value-types":13}],8:[function(require,module,exports){
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

},{"./InsertOpsConverter":4,"./OpGroup":6,"./OpToHtmlConverter":7,"./extensions/Object":10,"./funcs-html":12}],9:[function(require,module,exports){
Array.prototype._preferSecond = function () {
    if (this.length === 0) {
        return null;
    }
    return this.length >= 2 ? this[1] : this[0];
};
Array.prototype._flatten = function () {
    return this.reduce(function (pv, v) {
        return pv.concat(Array.isArray(v) ? v._flatten() : v);
    }, []);
};
Array.prototype._groupConsecutiveElementsWhile = function (predicate) {
    var groups = [];
    var currElm, currGroup;
    for (var i = 0; i < this.length; i++) {
        currElm = this[i];
        if (i > 0 && predicate(currElm, this[i - 1])) {
            currGroup = groups[groups.length - 1];
            currGroup.push(currElm);
        }
        else {
            groups.push([currElm]);
        }
    }
    return groups.map(function (g) { return g.length === 1 ? g[0] : g; });
};
Array.prototype._sliceFromReverseWhile = function (startIndex, predicate) {
    var result = {
        elements: [],
        sliceStartsAt: -1
    };
    for (var i = startIndex; i >= 0; i--) {
        if (!predicate(this[i])) {
            break;
        }
        result.sliceStartsAt = i;
        result.elements.unshift(this[i]);
    }
    return result;
};

},{}],10:[function(require,module,exports){
Object._assign = function (target, varArg1, varArg2) {
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
};

},{}],11:[function(require,module,exports){
String.prototype._tokenizeWithNewLines = function () {
    var NewLine = "\n";
    var this_ = this.toString();
    if (this_ === NewLine) {
        return [this_];
    }
    var lines = this.split(NewLine);
    if (lines.length === 1) {
        return lines;
    }
    var lastIndex = lines.length - 1;
    return lines.reduce(function (pv, line, ind) {
        if (ind !== lastIndex) {
            if (line !== "") {
                pv = pv.concat(line, NewLine);
            }
            else {
                pv.push(NewLine);
            }
        }
        else if (line !== "") {
            pv.push(line);
        }
        return pv;
    }, []);
};
String.prototype._scrubUrl = function () {
    return this.replace(/[^-A-Za-z0-9+&@#/%?=~_|!:,.;\(\)]/g, '');
};

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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
