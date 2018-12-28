(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.QuillDeltaToHtmlConverter = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var value_types_1 = require("./value-types");
var InsertData_1 = require("./InsertData");
var DeltaInsertOp = (function () {
    function DeltaInsertOp(insertVal, attrs) {
        if (typeof insertVal === 'string') {
            insertVal = new InsertData_1.InsertDataQuill(value_types_1.DataType.Text, insertVal + '');
        }
        this.insert = insertVal;
        this.attributes = attrs || {};
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
        return !!this.attributes.blockquote;
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
    DeltaInsertOp.prototype.hasSameIndentationAs = function (op) {
        return this.attributes.indent === op.attributes.indent;
    };
    DeltaInsertOp.prototype.hasHigherIndentThan = function (op) {
        return (Number(this.attributes.indent) || 0) > (Number(op.attributes.indent) || 0);
    };
    DeltaInsertOp.prototype.isInline = function () {
        return !(this.isContainerBlock() || this.isVideo() || this.isCustomBlock());
    };
    DeltaInsertOp.prototype.isCodeBlock = function () {
        return !!this.attributes['code-block'];
    };
    DeltaInsertOp.prototype.isJustNewline = function () {
        return this.insert.value === value_types_1.NewLine;
    };
    DeltaInsertOp.prototype.isList = function () {
        return (this.isOrderedList() ||
            this.isBulletList() ||
            this.isCheckedList() ||
            this.isUncheckedList());
    };
    DeltaInsertOp.prototype.isOrderedList = function () {
        return this.attributes.list === value_types_1.ListType.Ordered;
    };
    DeltaInsertOp.prototype.isBulletList = function () {
        return this.attributes.list === value_types_1.ListType.Bullet;
    };
    DeltaInsertOp.prototype.isCheckedList = function () {
        return this.attributes.list === value_types_1.ListType.Checked;
    };
    DeltaInsertOp.prototype.isUncheckedList = function () {
        return this.attributes.list === value_types_1.ListType.Unchecked;
    };
    DeltaInsertOp.prototype.isACheckList = function () {
        return this.attributes.list == value_types_1.ListType.Unchecked ||
            this.attributes.list === value_types_1.ListType.Checked;
    };
    DeltaInsertOp.prototype.isSameListAs = function (op) {
        return !!op.attributes.list && (this.attributes.list === op.attributes.list ||
            op.isACheckList() && this.isACheckList());
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
    DeltaInsertOp.prototype.isCustom = function () {
        return this.insert instanceof InsertData_1.InsertDataCustom;
    };
    DeltaInsertOp.prototype.isCustomBlock = function () {
        return this.isCustom() && !!this.attributes.renderAsBlock;
    };
    DeltaInsertOp.prototype.isMentions = function () {
        return this.isText() && !!this.attributes.mentions;
    };
    return DeltaInsertOp;
}());
exports.DeltaInsertOp = DeltaInsertOp;

},{"./InsertData":2,"./value-types":17}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InsertDataQuill = (function () {
    function InsertDataQuill(type, value) {
        this.type = type;
        this.value = value;
    }
    return InsertDataQuill;
}());
exports.InsertDataQuill = InsertDataQuill;
;
var InsertDataCustom = (function () {
    function InsertDataCustom(type, value) {
        this.type = type;
        this.value = value;
    }
    return InsertDataCustom;
}());
exports.InsertDataCustom = InsertDataCustom;
;

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var value_types_1 = require("./value-types");
var str = require("./helpers/string");
var obj = require("./helpers/object");
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
        var newlinedArray = str.tokenizeWithNewLines(op.insert + '');
        if (newlinedArray.length === 1) {
            return [op];
        }
        var nlObj = obj.assign({}, op, { insert: value_types_1.NewLine });
        return newlinedArray.map(function (line) {
            if (line === value_types_1.NewLine) {
                return nlObj;
            }
            return obj.assign({}, op, {
                insert: line
            });
        });
    };
    return InsertOpDenormalizer;
}());
exports.InsertOpDenormalizer = InsertOpDenormalizer;

},{"./helpers/object":13,"./helpers/string":14,"./value-types":17}],4:[function(require,module,exports){
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
    InsertOpsConverter.convert = function (deltaOps, options) {
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
            insertVal = InsertOpsConverter.convertInsertVal(op.insert, options);
            if (!insertVal) {
                continue;
            }
            attributes = OpAttributeSanitizer_1.OpAttributeSanitizer.sanitize(op.attributes, options);
            results.push(new DeltaInsertOp_1.DeltaInsertOp(insertVal, attributes));
        }
        return results;
    };
    InsertOpsConverter.convertInsertVal = function (insertPropVal, sanitizeOptions) {
        if (typeof insertPropVal === 'string') {
            return new InsertData_1.InsertDataQuill(value_types_1.DataType.Text, insertPropVal);
        }
        if (!insertPropVal || typeof insertPropVal !== 'object') {
            return null;
        }
        var keys = Object.keys(insertPropVal);
        if (!keys.length) {
            return null;
        }
        return value_types_1.DataType.Image in insertPropVal ?
            new InsertData_1.InsertDataQuill(value_types_1.DataType.Image, OpAttributeSanitizer_1.OpAttributeSanitizer.sanitizeLinkUsingOptions(insertPropVal[value_types_1.DataType.Image] + '', sanitizeOptions))
            : value_types_1.DataType.Video in insertPropVal ?
                new InsertData_1.InsertDataQuill(value_types_1.DataType.Video, OpAttributeSanitizer_1.OpAttributeSanitizer.sanitizeLinkUsingOptions(insertPropVal[value_types_1.DataType.Video] + '', sanitizeOptions))
                : value_types_1.DataType.Formula in insertPropVal ?
                    new InsertData_1.InsertDataQuill(value_types_1.DataType.Formula, insertPropVal[value_types_1.DataType.Formula])
                    : new InsertData_1.InsertDataCustom(keys[0], insertPropVal[keys[0]]);
    };
    return InsertOpsConverter;
}());
exports.InsertOpsConverter = InsertOpsConverter;

},{"./DeltaInsertOp":1,"./InsertData":2,"./InsertOpDenormalizer":3,"./OpAttributeSanitizer":5,"./value-types":17}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var value_types_1 = require("./value-types");
var MentionSanitizer_1 = require("./mentions/MentionSanitizer");
var url = require("./helpers/url");
var funcs_html_1 = require("./funcs-html");
var OpAttributeSanitizer = (function () {
    function OpAttributeSanitizer() {
    }
    OpAttributeSanitizer.sanitize = function (dirtyAttrs, sanitizeOptions) {
        var cleanAttrs = {};
        if (!dirtyAttrs || typeof dirtyAttrs !== 'object') {
            return cleanAttrs;
        }
        var booleanAttrs = [
            'bold', 'italic', 'underline', 'strike', 'code',
            'blockquote', 'code-block', 'renderAsBlock'
        ];
        var colorAttrs = ['background', 'color'];
        var font = dirtyAttrs.font, size = dirtyAttrs.size, link = dirtyAttrs.link, script = dirtyAttrs.script, list = dirtyAttrs.list, header = dirtyAttrs.header, align = dirtyAttrs.align, direction = dirtyAttrs.direction, indent = dirtyAttrs.indent, mentions = dirtyAttrs.mentions, mention = dirtyAttrs.mention, width = dirtyAttrs.width, target = dirtyAttrs.target;
        var sanitizedAttrs = booleanAttrs.concat(colorAttrs, ['font', 'size', 'link', 'script', 'list', 'header', 'align',
            'direction', 'indent', 'mentions', 'mention', 'width']);
        booleanAttrs.forEach(function (prop) {
            var v = dirtyAttrs[prop];
            if (v) {
                cleanAttrs[prop] = !!v;
            }
        });
        colorAttrs.forEach(function (prop) {
            var val = dirtyAttrs[prop];
            if (val && (OpAttributeSanitizer.IsValidHexColor(val + '') ||
                OpAttributeSanitizer.IsValidColorLiteral(val + '') ||
                OpAttributeSanitizer.IsValidRGBColor(val + ''))) {
                cleanAttrs[prop] = val;
            }
        });
        if (font && OpAttributeSanitizer.IsValidFontName(font + '')) {
            cleanAttrs.font = font;
        }
        if (size && OpAttributeSanitizer.IsValidSize(size + '')) {
            cleanAttrs.size = size;
        }
        if (width && OpAttributeSanitizer.IsValidWidth(width + '')) {
            cleanAttrs.width = width;
        }
        if (link) {
            cleanAttrs.link = OpAttributeSanitizer.sanitizeLinkUsingOptions(link + '', sanitizeOptions);
        }
        if (target && OpAttributeSanitizer.isValidTarget(target)) {
            cleanAttrs.target = target;
        }
        if (script === value_types_1.ScriptType.Sub || value_types_1.ScriptType.Super === script) {
            cleanAttrs.script = script;
        }
        if (list === value_types_1.ListType.Bullet || list === value_types_1.ListType.Ordered || list === value_types_1.ListType.Checked || list === value_types_1.ListType.Unchecked) {
            cleanAttrs.list = list;
        }
        if (Number(header)) {
            cleanAttrs.header = Math.min(Number(header), 6);
        }
        if (align === value_types_1.AlignType.Center || align === value_types_1.AlignType.Right || align === value_types_1.AlignType.Justify) {
            cleanAttrs.align = align;
        }
        if (direction === value_types_1.DirectionType.Rtl) {
            cleanAttrs.direction = direction;
        }
        if (indent && Number(indent)) {
            cleanAttrs.indent = Math.min(Number(indent), 30);
        }
        if (mentions && mention) {
            var sanitizedMention = MentionSanitizer_1.MentionSanitizer.sanitize(mention, sanitizeOptions);
            if (Object.keys(sanitizedMention).length > 0) {
                cleanAttrs.mentions = !!mentions;
                cleanAttrs.mention = mention;
            }
        }
        return Object.keys(dirtyAttrs).reduce(function (cleaned, k) {
            if (sanitizedAttrs.indexOf(k) === -1) {
                cleaned[k] = dirtyAttrs[k];
            }
            ;
            return cleaned;
        }, cleanAttrs);
    };
    OpAttributeSanitizer.sanitizeLinkUsingOptions = function (link, options) {
        var sanitizerFn = function () { return undefined; };
        if (options && typeof options.urlSanitizer === 'function') {
            sanitizerFn = options.urlSanitizer;
        }
        var result = sanitizerFn(link);
        return typeof result === 'string' ?
            result :
            funcs_html_1.encodeLink(url.sanitize(link));
    };
    OpAttributeSanitizer.IsValidHexColor = function (colorStr) {
        return !!colorStr.match(/^#([0-9A-F]{6}|[0-9A-F]{3})$/i);
    };
    OpAttributeSanitizer.IsValidColorLiteral = function (colorStr) {
        return !!colorStr.match(/^[a-z]{1,50}$/i);
    };
    OpAttributeSanitizer.IsValidRGBColor = function (colorStr) {
        var re = /^rgb\(((0|25[0-5]|2[0-4]\d|1\d\d|0?\d?\d),\s*){2}(0|25[0-5]|2[0-4]\d|1\d\d|0?\d?\d)\)$/i;
        return !!colorStr.match(re);
    };
    OpAttributeSanitizer.IsValidFontName = function (fontName) {
        return !!fontName.match(/^[a-z\s0-9\- ]{1,30}$/i);
    };
    OpAttributeSanitizer.IsValidSize = function (size) {
        return !!size.match(/^[a-z0-9\-]{1,20}$/i);
    };
    OpAttributeSanitizer.IsValidWidth = function (width) {
        return !!width.match(/^[0-9]*(px|em|%)?$/);
    };
    OpAttributeSanitizer.isValidTarget = function (target) {
        return !!target.match(/^[_a-zA-Z0-9\-]{1,50}$/);
    };
    return OpAttributeSanitizer;
}());
exports.OpAttributeSanitizer = OpAttributeSanitizer;

},{"./funcs-html":8,"./helpers/url":15,"./mentions/MentionSanitizer":16,"./value-types":17}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var funcs_html_1 = require("./funcs-html");
var value_types_1 = require("./value-types");
var obj = require("./helpers/object");
var arr = require("./helpers/array");
var OpAttributeSanitizer_1 = require("./OpAttributeSanitizer");
;
var DEFAULT_INLINE_FONTS = {
    serif: 'font-family: Georgia, Times New Roman, serif',
    monospace: 'font-family: Monaco, Courier New, monospace'
};
exports.DEFAULT_INLINE_STYLES = {
    font: function (value) { return DEFAULT_INLINE_FONTS[value] || ('font-family:' + value); },
    size: {
        'small': 'font-size: 0.75em',
        'large': 'font-size: 1.5em',
        'huge': 'font-size: 2.5em'
    },
    indent: function (value, op) {
        var indentSize = parseInt(value, 10) * 3;
        var side = op.attributes['direction'] === 'rtl' ? 'right' : 'left';
        return 'padding-' + side + ':' + indentSize + 'em';
    },
    direction: function (value, op) {
        if (value === 'rtl') {
            return 'direction:rtl' + (op.attributes['align'] ? '' : '; text-align:inherit');
        }
        else {
            return undefined;
        }
    }
};
var OpToHtmlConverter = (function () {
    function OpToHtmlConverter(op, options) {
        this.op = op;
        this.options = obj.assign({}, {
            classPrefix: 'ql',
            inlineStyles: undefined,
            encodeHtml: true,
            listItemTag: 'li',
            paragraphTag: 'p'
        }, options);
    }
    OpToHtmlConverter.prototype.prefixClass = function (className) {
        if (!this.options.classPrefix) {
            return className + '';
        }
        return this.options.classPrefix + '-' + className;
    };
    OpToHtmlConverter.prototype.getHtml = function () {
        var parts = this.getHtmlParts();
        return parts.openingTag + parts.content + parts.closingTag;
    };
    OpToHtmlConverter.prototype.getHtmlParts = function () {
        var _this = this;
        if (this.op.isJustNewline() && !this.op.isContainerBlock()) {
            return { openingTag: '', closingTag: '', content: value_types_1.NewLine };
        }
        var tags = this.getTags(), attrs = this.getTagAttributes();
        if (!tags.length && attrs.length) {
            tags.push('span');
        }
        var beginTags = [], endTags = [];
        var imgTag = "img";
        var isImageLink = function (tag) { return tag === imgTag && !!_this.op.attributes.link; };
        for (var _i = 0, tags_1 = tags; _i < tags_1.length; _i++) {
            var tag = tags_1[_i];
            if (isImageLink(tag)) {
                beginTags.push(funcs_html_1.makeStartTag('a', this.getLinkAttrs()));
            }
            beginTags.push(funcs_html_1.makeStartTag(tag, attrs));
            endTags.push(tag === 'img' ? '' : funcs_html_1.makeEndTag(tag));
            if (isImageLink(tag)) {
                endTags.push(funcs_html_1.makeEndTag('a'));
            }
            attrs = [];
        }
        endTags.reverse();
        return {
            openingTag: beginTags.join(''),
            content: this.getContent(),
            closingTag: endTags.join('')
        };
    };
    OpToHtmlConverter.prototype.getContent = function () {
        if (this.op.isContainerBlock()) {
            return '';
        }
        if (this.op.isMentions()) {
            return this.op.insert.value;
        }
        var content = this.op.isFormula() || this.op.isText() ? this.op.insert.value : '';
        return this.options.encodeHtml && funcs_html_1.encodeHtml(content) || content;
    };
    OpToHtmlConverter.prototype.getCssClasses = function () {
        var attrs = this.op.attributes;
        if (this.options.inlineStyles) {
            return [];
        }
        var propsArr = ['indent', 'align', 'direction', 'font', 'size'];
        if (this.options.allowBackgroundClasses) {
            propsArr.push('background');
        }
        return propsArr
            .filter(function (prop) { return !!attrs[prop]; })
            .filter(function (prop) { return prop === 'background' ? OpAttributeSanitizer_1.OpAttributeSanitizer.IsValidColorLiteral(attrs[prop]) : true; })
            .map(function (prop) { return prop + '-' + attrs[prop]; })
            .concat(this.op.isFormula() ? 'formula' : [])
            .concat(this.op.isVideo() ? 'video' : [])
            .concat(this.op.isImage() ? 'image' : [])
            .map(this.prefixClass.bind(this));
    };
    OpToHtmlConverter.prototype.getCssStyles = function () {
        var _this = this;
        var attrs = this.op.attributes;
        var propsArr = [['color']];
        if (!!this.options.inlineStyles || !this.options.allowBackgroundClasses) {
            propsArr.push(['background', 'background-color']);
        }
        if (this.options.inlineStyles) {
            propsArr = propsArr.concat([
                ['indent'],
                ['align', 'text-align'],
                ['direction'],
                ['font', 'font-family'],
                ['size']
            ]);
        }
        return propsArr
            .filter(function (item) { return !!attrs[item[0]]; })
            .map(function (item) {
            var attribute = item[0];
            var attrValue = attrs[attribute];
            var attributeConverter = (_this.options.inlineStyles && _this.options.inlineStyles[attribute]) ||
                exports.DEFAULT_INLINE_STYLES[attribute];
            if (typeof (attributeConverter) === 'object') {
                return attributeConverter[attrValue];
            }
            else if (typeof (attributeConverter) === 'function') {
                var converterFn = attributeConverter;
                return converterFn(attrValue, _this.op);
            }
            else {
                return arr.preferSecond(item) + ':' + attrValue;
            }
        })
            .filter(function (item) { return item !== undefined; });
    };
    OpToHtmlConverter.prototype.getTagAttributes = function () {
        if (this.op.attributes.code && !this.op.isLink()) {
            return [];
        }
        var makeAttr = this.makeAttr.bind(this);
        var classes = this.getCssClasses();
        var tagAttrs = classes.length ? [makeAttr('class', classes.join(' '))] : [];
        if (this.op.isImage()) {
            this.op.attributes.width && (tagAttrs = tagAttrs.concat(makeAttr('width', this.op.attributes.width)));
            return tagAttrs.concat(makeAttr('src', this.op.insert.value));
        }
        if (this.op.isACheckList()) {
            return tagAttrs.concat(makeAttr('data-checked', this.op.isCheckedList() ? 'true' : 'false'));
        }
        if (this.op.isFormula()) {
            return tagAttrs;
        }
        if (this.op.isVideo()) {
            return tagAttrs.concat(makeAttr('frameborder', '0'), makeAttr('allowfullscreen', 'true'), makeAttr('src', this.op.insert.value));
        }
        if (this.op.isMentions()) {
            var mention = this.op.attributes.mention;
            if (mention.class) {
                tagAttrs = tagAttrs.concat(makeAttr('class', mention.class));
            }
            if (mention['end-point'] && mention.slug) {
                tagAttrs = tagAttrs.concat(makeAttr('href', mention['end-point'] + '/' + mention.slug));
            }
            else {
                tagAttrs = tagAttrs.concat(makeAttr('href', 'about:blank'));
            }
            if (mention.target) {
                tagAttrs = tagAttrs.concat(makeAttr('target', mention.target));
            }
            return tagAttrs;
        }
        var styles = this.getCssStyles();
        if (styles.length) {
            tagAttrs.push(makeAttr('style', styles.join(';')));
        }
        if (this.op.isContainerBlock()) {
            return tagAttrs;
        }
        if (this.op.isLink()) {
            tagAttrs = tagAttrs.concat(this.getLinkAttrs());
        }
        return tagAttrs;
    };
    OpToHtmlConverter.prototype.makeAttr = function (k, v) {
        return { key: k, value: v };
    };
    OpToHtmlConverter.prototype.getLinkAttrs = function () {
        var tagAttrs = [];
        var target = this.op.attributes.target || this.options.linkTarget;
        tagAttrs = tagAttrs
            .concat(this.makeAttr('href', this.op.attributes.link))
            .concat(target ? this.makeAttr('target', target) : []);
        if (!!this.options.linkRel && OpToHtmlConverter.IsValidRel(this.options.linkRel)) {
            tagAttrs.push(this.makeAttr('rel', this.options.linkRel));
        }
        return tagAttrs;
    };
    OpToHtmlConverter.prototype.getTags = function () {
        var attrs = this.op.attributes;
        if (!this.op.isText()) {
            return [this.op.isVideo() ? 'iframe'
                    : this.op.isImage() ? 'img'
                        : 'span'
            ];
        }
        var positionTag = this.options.paragraphTag || 'p';
        var blocks = [['blockquote'], ['code-block', 'pre'],
            ['list', this.options.listItemTag], ['header'],
            ['align', positionTag], ['direction', positionTag],
            ['indent', positionTag]];
        for (var _i = 0, blocks_1 = blocks; _i < blocks_1.length; _i++) {
            var item = blocks_1[_i];
            var firstItem = item[0];
            if (attrs[firstItem]) {
                return firstItem === 'header' ? ['h' + attrs[firstItem]] : [arr.preferSecond(item)];
            }
        }
        return [['link', 'a'], ['mentions', 'a'], ['script'],
            ['bold', 'strong'], ['italic', 'em'], ['strike', 's'], ['underline', 'u'],
            ['code']]
            .filter(function (item) { return !!attrs[item[0]]; })
            .map(function (item) {
            return item[0] === 'script' ?
                (attrs[item[0]] === value_types_1.ScriptType.Sub ? 'sub' : 'sup')
                : arr.preferSecond(item);
        });
    };
    OpToHtmlConverter.IsValidRel = function (relStr) {
        return !!relStr.match(/^[a-z\s]{1,50}$/i);
    };
    return OpToHtmlConverter;
}());
exports.OpToHtmlConverter = OpToHtmlConverter;

},{"./OpAttributeSanitizer":5,"./funcs-html":8,"./helpers/array":12,"./helpers/object":13,"./value-types":17}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InsertOpsConverter_1 = require("./InsertOpsConverter");
var OpToHtmlConverter_1 = require("./OpToHtmlConverter");
var Grouper_1 = require("./grouper/Grouper");
var group_types_1 = require("./grouper/group-types");
var ListNester_1 = require("./grouper/ListNester");
var funcs_html_1 = require("./funcs-html");
var obj = require("./helpers/object");
var value_types_1 = require("./value-types");
var BrTag = '<br/>';
var QuillDeltaToHtmlConverter = (function () {
    function QuillDeltaToHtmlConverter(deltaOps, options) {
        this.rawDeltaOps = [];
        this.callbacks = {};
        this.options = obj.assign({
            paragraphTag: 'p',
            encodeHtml: true,
            classPrefix: 'ql',
            inlineStyles: false,
            multiLineBlockquote: true,
            multiLineHeader: true,
            multiLineCodeblock: true,
            multiLineParagraph: true,
            allowBackgroundClasses: false,
            linkTarget: '_blank'
        }, options, {
            orderedListTag: 'ol',
            bulletListTag: 'ul',
            listItemTag: 'li'
        });
        var inlineStyles;
        if (!this.options.inlineStyles) {
            inlineStyles = undefined;
        }
        else if (typeof (this.options.inlineStyles) === 'object') {
            inlineStyles = this.options.inlineStyles;
        }
        else {
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
            allowBackgroundClasses: this.options.allowBackgroundClasses
        };
        this.rawDeltaOps = deltaOps;
    }
    QuillDeltaToHtmlConverter.prototype._getListTag = function (op) {
        return op.isOrderedList() ? this.options.orderedListTag + ''
            : op.isBulletList() ? this.options.bulletListTag + ''
                : op.isCheckedList() ? this.options.bulletListTag + ''
                    : op.isUncheckedList() ? this.options.bulletListTag + ''
                        : '';
    };
    QuillDeltaToHtmlConverter.prototype.getGroupedOps = function () {
        var deltaOps = InsertOpsConverter_1.InsertOpsConverter.convert(this.rawDeltaOps, this.options);
        var pairedOps = Grouper_1.Grouper.pairOpsWithTheirBlock(deltaOps);
        var groupedSameStyleBlocks = Grouper_1.Grouper.groupConsecutiveSameStyleBlocks(pairedOps, {
            blockquotes: !!this.options.multiLineBlockquote,
            header: !!this.options.multiLineHeader,
            codeBlocks: !!this.options.multiLineCodeblock
        });
        var groupedOps = Grouper_1.Grouper.reduceConsecutiveSameStyleBlocksToOne(groupedSameStyleBlocks);
        var listNester = new ListNester_1.ListNester();
        return listNester.nest(groupedOps);
    };
    QuillDeltaToHtmlConverter.prototype.convert = function () {
        var _this = this;
        var groups = this.getGroupedOps();
        return groups.map(function (group) {
            if (group instanceof group_types_1.ListGroup) {
                return _this._renderWithCallbacks(value_types_1.GroupType.List, group, function () { return _this._renderList(group); });
            }
            else if (group instanceof group_types_1.BlockGroup) {
                var g = group;
                return _this._renderWithCallbacks(value_types_1.GroupType.Block, group, function () { return _this._renderBlock(g.op, g.ops); });
            }
            else if (group instanceof group_types_1.BlotBlock) {
                return _this._renderCustom(group.op, null);
            }
            else if (group instanceof group_types_1.VideoItem) {
                return _this._renderWithCallbacks(value_types_1.GroupType.Video, group, function () {
                    var g = group;
                    var converter = new OpToHtmlConverter_1.OpToHtmlConverter(g.op, _this.converterOptions);
                    return converter.getHtml();
                });
            }
            else {
                return _this._renderWithCallbacks(value_types_1.GroupType.InlineGroup, group, function () {
                    return _this._renderInlines(group.ops, true);
                });
            }
        })
            .join("");
    };
    QuillDeltaToHtmlConverter.prototype._renderWithCallbacks = function (groupType, group, myRenderFn) {
        var html = '';
        var beforeCb = this.callbacks['beforeRender_cb'];
        html = typeof beforeCb === 'function' ? beforeCb.apply(null, [groupType, group]) : '';
        if (!html) {
            html = myRenderFn();
        }
        var afterCb = this.callbacks['afterRender_cb'];
        html = typeof afterCb === 'function' ? afterCb.apply(null, [groupType, html]) : html;
        return html;
    };
    QuillDeltaToHtmlConverter.prototype._renderList = function (list) {
        var _this = this;
        var firstItem = list.items[0];
        return funcs_html_1.makeStartTag(this._getListTag(firstItem.item.op))
            + list.items.map(function (li) { return _this._renderListItem(li); }).join('')
            + funcs_html_1.makeEndTag(this._getListTag(firstItem.item.op));
    };
    QuillDeltaToHtmlConverter.prototype._renderListItem = function (li) {
        li.item.op.attributes.indent = 0;
        var converter = new OpToHtmlConverter_1.OpToHtmlConverter(li.item.op, this.converterOptions);
        var parts = converter.getHtmlParts();
        var liElementsHtml = this._renderInlines(li.item.ops, false);
        return parts.openingTag + (liElementsHtml) +
            (li.innerList ? this._renderList(li.innerList) : '')
            + parts.closingTag;
    };
    QuillDeltaToHtmlConverter.prototype._renderBlock = function (bop, ops) {
        var _this = this;
        var converter = new OpToHtmlConverter_1.OpToHtmlConverter(bop, this.converterOptions);
        var htmlParts = converter.getHtmlParts();
        if (bop.isCodeBlock()) {
            return htmlParts.openingTag +
                funcs_html_1.encodeHtml(ops.map(function (iop) {
                    return iop.isCustom() ? _this._renderCustom(iop, bop) : iop.insert.value;
                }).join(""))
                + htmlParts.closingTag;
        }
        var inlines = ops.map(function (op) { return _this._renderInline(op, bop); }).join('');
        return htmlParts.openingTag + (inlines || BrTag) + htmlParts.closingTag;
    };
    QuillDeltaToHtmlConverter.prototype._renderInlines = function (ops, isInlineGroup) {
        var _this = this;
        if (isInlineGroup === void 0) { isInlineGroup = true; }
        var opsLen = ops.length - 1;
        var html = ops.map(function (op, i) {
            if (i > 0 && i === opsLen && op.isJustNewline()) {
                return '';
            }
            return _this._renderInline(op, null);
        }).join('');
        if (!isInlineGroup) {
            return html;
        }
        var startParaTag = funcs_html_1.makeStartTag(this.options.paragraphTag);
        var endParaTag = funcs_html_1.makeEndTag(this.options.paragraphTag);
        if (html === BrTag || this.options.multiLineParagraph) {
            return startParaTag + html + endParaTag;
        }
        return startParaTag + html.split(BrTag).map(function (v) {
            return v === '' ? BrTag : v;
        }).join(endParaTag + startParaTag) + endParaTag;
    };
    QuillDeltaToHtmlConverter.prototype._renderInline = function (op, contextOp) {
        if (op.isCustom()) {
            return this._renderCustom(op, contextOp);
        }
        var converter = new OpToHtmlConverter_1.OpToHtmlConverter(op, this.converterOptions);
        return converter.getHtml().replace(/\n/g, BrTag);
    };
    QuillDeltaToHtmlConverter.prototype._renderCustom = function (op, contextOp) {
        var renderCb = this.callbacks['renderCustomOp_cb'];
        if (typeof renderCb === 'function') {
            return renderCb.apply(null, [op, contextOp]);
        }
        return "";
    };
    QuillDeltaToHtmlConverter.prototype.beforeRender = function (cb) {
        if (typeof cb === 'function') {
            this.callbacks['beforeRender_cb'] = cb;
        }
    };
    QuillDeltaToHtmlConverter.prototype.afterRender = function (cb) {
        if (typeof cb === 'function') {
            this.callbacks['afterRender_cb'] = cb;
        }
    };
    QuillDeltaToHtmlConverter.prototype.renderCustomWith = function (cb) {
        this.callbacks['renderCustomOp_cb'] = cb;
    };
    return QuillDeltaToHtmlConverter;
}());
exports.QuillDeltaToHtmlConverter = QuillDeltaToHtmlConverter;

},{"./InsertOpsConverter":4,"./OpToHtmlConverter":6,"./funcs-html":8,"./grouper/Grouper":9,"./grouper/ListNester":10,"./grouper/group-types":11,"./helpers/object":13,"./value-types":17}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EncodeTarget;
(function (EncodeTarget) {
    EncodeTarget[EncodeTarget["Html"] = 0] = "Html";
    EncodeTarget[EncodeTarget["Url"] = 1] = "Url";
})(EncodeTarget || (EncodeTarget = {}));
function makeStartTag(tag, attrs) {
    if (attrs === void 0) { attrs = undefined; }
    if (!tag) {
        return '';
    }
    var attrsStr = '';
    if (attrs) {
        var arrAttrs = [].concat(attrs);
        attrsStr = arrAttrs.map(function (attr) {
            return attr.key + (attr.value ? '="' + attr.value + '"' : '');
        }).join(' ');
    }
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
    return encodeMappings(EncodeTarget.Html).reduce(decodeMapping, str);
}
exports.decodeHtml = decodeHtml;
function encodeHtml(str, preventDoubleEncoding) {
    if (preventDoubleEncoding === void 0) { preventDoubleEncoding = true; }
    if (preventDoubleEncoding) {
        str = decodeHtml(str);
    }
    return encodeMappings(EncodeTarget.Html).reduce(encodeMapping, str);
}
exports.encodeHtml = encodeHtml;
function encodeLink(str) {
    var linkMaps = encodeMappings(EncodeTarget.Url);
    var decoded = linkMaps.reduce(decodeMapping, str);
    return linkMaps.reduce(encodeMapping, decoded);
}
exports.encodeLink = encodeLink;
function encodeMappings(mtype) {
    var maps = [
        ['&', '&amp;'],
        ['<', '&lt;'],
        ['>', '&gt;'],
        ['"', '&quot;'],
        ["'", "&#x27;"],
        ['\\/', '&#x2F;'],
        ['\\(', '&#40;'],
        ['\\)', '&#41;']
    ];
    if (mtype === EncodeTarget.Html) {
        return maps.filter(function (_a) {
            var v = _a[0], _ = _a[1];
            return v.indexOf('(') === -1 && v.indexOf(')') === -1;
        });
    }
    else {
        return maps.filter(function (_a) {
            var v = _a[0], _ = _a[1];
            return v.indexOf('/') === -1;
        });
    }
}
function encodeMapping(str, mapping) {
    return str.replace(new RegExp(mapping[0], 'g'), mapping[1]);
}
function decodeMapping(str, mapping) {
    return str.replace(new RegExp(mapping[1], 'g'), mapping[0].replace('\\', ''));
}

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DeltaInsertOp_1 = require("./../DeltaInsertOp");
var array_1 = require("./../helpers/array");
var group_types_1 = require("./group-types");
var Grouper = (function () {
    function Grouper() {
    }
    Grouper.pairOpsWithTheirBlock = function (ops) {
        var result = [];
        var canBeInBlock = function (op) {
            return !(op.isJustNewline() || op.isCustomBlock() || op.isVideo() || op.isContainerBlock());
        };
        var isInlineData = function (op) { return op.isInline(); };
        var lastInd = ops.length - 1;
        var opsSlice;
        for (var i = lastInd; i >= 0; i--) {
            var op = ops[i];
            if (op.isVideo()) {
                result.push(new group_types_1.VideoItem(op));
            }
            else if (op.isCustomBlock()) {
                result.push(new group_types_1.BlotBlock(op));
            }
            else if (op.isContainerBlock()) {
                opsSlice = array_1.sliceFromReverseWhile(ops, i - 1, canBeInBlock);
                result.push(new group_types_1.BlockGroup(op, opsSlice.elements));
                i = opsSlice.sliceStartsAt > -1 ? opsSlice.sliceStartsAt : i;
            }
            else {
                opsSlice = array_1.sliceFromReverseWhile(ops, i - 1, isInlineData);
                result.push(new group_types_1.InlineGroup(opsSlice.elements.concat(op)));
                i = opsSlice.sliceStartsAt > -1 ? opsSlice.sliceStartsAt : i;
            }
        }
        result.reverse();
        return result;
    };
    Grouper.groupConsecutiveSameStyleBlocks = function (groups, blocksOf) {
        if (blocksOf === void 0) { blocksOf = {
            header: true,
            codeBlocks: true,
            blockquotes: true
        }; }
        return array_1.groupConsecutiveElementsWhile(groups, function (g, gPrev) {
            if (!(g instanceof group_types_1.BlockGroup) || !(gPrev instanceof group_types_1.BlockGroup)) {
                return false;
            }
            return blocksOf.codeBlocks && Grouper.areBothCodeblocks(g, gPrev)
                || blocksOf.blockquotes && Grouper.areBothBlockquotesWithSameAdi(g, gPrev)
                || blocksOf.header && Grouper.areBothSameHeadersWithSameAdi(g, gPrev);
        });
    };
    Grouper.reduceConsecutiveSameStyleBlocksToOne = function (groups) {
        var newLineOp = DeltaInsertOp_1.DeltaInsertOp.createNewLineOp();
        return groups.map(function (elm) {
            if (!Array.isArray(elm)) {
                if (elm instanceof group_types_1.BlockGroup && !elm.ops.length) {
                    elm.ops.push(newLineOp);
                }
                return elm;
            }
            var groupsLastInd = elm.length - 1;
            elm[0].ops = array_1.flatten(elm.map(function (g, i) {
                if (!g.ops.length) {
                    return [newLineOp];
                }
                return g.ops.concat(i < groupsLastInd ? [newLineOp] : []);
            }));
            return elm[0];
        });
    };
    Grouper.areBothCodeblocks = function (g1, gOther) {
        return g1.op.isCodeBlock() && gOther.op.isCodeBlock();
    };
    Grouper.areBothSameHeadersWithSameAdi = function (g1, gOther) {
        return g1.op.isSameHeaderAs(gOther.op) && g1.op.hasSameAdiAs(gOther.op);
    };
    Grouper.areBothBlockquotesWithSameAdi = function (g, gOther) {
        return g.op.isBlockquote() && gOther.op.isBlockquote()
            && g.op.hasSameAdiAs(gOther.op);
    };
    return Grouper;
}());
exports.Grouper = Grouper;

},{"./../DeltaInsertOp":1,"./../helpers/array":12,"./group-types":11}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var group_types_1 = require("./group-types");
var array_1 = require("./../helpers/array");
var ListNester = (function () {
    function ListNester() {
    }
    ListNester.prototype.nest = function (groups) {
        var _this = this;
        var listBlocked = this.convertListBlocksToListGroups(groups);
        var groupedByListGroups = this.groupConsecutiveListGroups(listBlocked);
        var nested = array_1.flatten(groupedByListGroups.map(function (group) {
            if (!Array.isArray(group)) {
                return group;
            }
            return _this.nestListSection(group);
        }));
        var groupRootLists = array_1.groupConsecutiveElementsWhile(nested, function (curr, prev) {
            if (!(curr instanceof group_types_1.ListGroup && prev instanceof group_types_1.ListGroup)) {
                return false;
            }
            return curr.items[0].item.op.isSameListAs(prev.items[0].item.op);
        });
        return groupRootLists.map(function (v) {
            if (!Array.isArray(v)) {
                return v;
            }
            var litems = v.map(function (g) { return g.items; });
            return new group_types_1.ListGroup(array_1.flatten(litems));
        });
    };
    ListNester.prototype.convertListBlocksToListGroups = function (items) {
        var grouped = array_1.groupConsecutiveElementsWhile(items, function (g, gPrev) {
            return g instanceof group_types_1.BlockGroup && gPrev instanceof group_types_1.BlockGroup
                && g.op.isList() && gPrev.op.isList() && g.op.isSameListAs(gPrev.op)
                && g.op.hasSameIndentationAs(gPrev.op);
        });
        return grouped.map(function (item) {
            if (!Array.isArray(item)) {
                if (item instanceof group_types_1.BlockGroup && item.op.isList()) {
                    return new group_types_1.ListGroup([new group_types_1.ListItem(item)]);
                }
                return item;
            }
            return new group_types_1.ListGroup(item.map(function (g) { return new group_types_1.ListItem(g); }));
        });
    };
    ListNester.prototype.groupConsecutiveListGroups = function (items) {
        return array_1.groupConsecutiveElementsWhile(items, function (curr, prev) {
            return curr instanceof group_types_1.ListGroup && prev instanceof group_types_1.ListGroup;
        });
    };
    ListNester.prototype.nestListSection = function (sectionItems) {
        var _this = this;
        var indentGroups = this.groupByIndent(sectionItems);
        Object.keys(indentGroups).map(Number).sort().reverse().forEach(function (indent) {
            indentGroups[indent].forEach(function (lg) {
                var idx = sectionItems.indexOf(lg);
                if (_this.placeUnderParent(lg, sectionItems.slice(0, idx))) {
                    sectionItems.splice(idx, 1);
                }
            });
        });
        return sectionItems;
    };
    ListNester.prototype.groupByIndent = function (items) {
        return items.reduce(function (pv, cv) {
            var indent = cv.items[0].item.op.attributes.indent;
            if (indent) {
                pv[indent] = pv[indent] || [];
                pv[indent].push(cv);
            }
            return pv;
        }, {});
    };
    ListNester.prototype.placeUnderParent = function (target, items) {
        for (var i = items.length - 1; i >= 0; i--) {
            var elm = items[i];
            if (target.items[0].item.op.hasHigherIndentThan(elm.items[0].item.op)) {
                var parent = elm.items[elm.items.length - 1];
                if (parent.innerList) {
                    parent.innerList.items = parent.innerList.items.concat(target.items);
                }
                else {
                    parent.innerList = target;
                }
                return true;
            }
        }
        return false;
    };
    return ListNester;
}());
exports.ListNester = ListNester;

},{"./../helpers/array":12,"./group-types":11}],11:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var InlineGroup = (function () {
    function InlineGroup(ops) {
        this.ops = ops;
    }
    return InlineGroup;
}());
exports.InlineGroup = InlineGroup;
var SingleItem = (function () {
    function SingleItem(op) {
        this.op = op;
    }
    return SingleItem;
}());
var VideoItem = (function (_super) {
    __extends(VideoItem, _super);
    function VideoItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return VideoItem;
}(SingleItem));
exports.VideoItem = VideoItem;
;
var BlotBlock = (function (_super) {
    __extends(BlotBlock, _super);
    function BlotBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return BlotBlock;
}(SingleItem));
exports.BlotBlock = BlotBlock;
;
var BlockGroup = (function () {
    function BlockGroup(op, ops) {
        this.op = op;
        this.ops = ops;
    }
    return BlockGroup;
}());
exports.BlockGroup = BlockGroup;
var ListGroup = (function () {
    function ListGroup(items) {
        this.items = items;
    }
    return ListGroup;
}());
exports.ListGroup = ListGroup;
var ListItem = (function () {
    function ListItem(item, innerList) {
        if (innerList === void 0) { innerList = null; }
        this.item = item;
        this.innerList = innerList;
    }
    return ListItem;
}());
exports.ListItem = ListItem;

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function preferSecond(arr) {
    if (arr.length === 0) {
        return null;
    }
    return arr.length >= 2 ? arr[1] : arr[0];
}
exports.preferSecond = preferSecond;
;
function flatten(arr) {
    return arr.reduce(function (pv, v) {
        return pv.concat(Array.isArray(v) ? flatten(v) : v);
    }, []);
}
exports.flatten = flatten;
;
function groupConsecutiveElementsWhile(arr, predicate) {
    var groups = [];
    var currElm, currGroup;
    for (var i = 0; i < arr.length; i++) {
        currElm = arr[i];
        if (i > 0 && predicate(currElm, arr[i - 1])) {
            currGroup = groups[groups.length - 1];
            currGroup.push(currElm);
        }
        else {
            groups.push([currElm]);
        }
    }
    return groups.map(function (g) { return g.length === 1 ? g[0] : g; });
}
exports.groupConsecutiveElementsWhile = groupConsecutiveElementsWhile;
;
function sliceFromReverseWhile(arr, startIndex, predicate) {
    var result = {
        elements: [],
        sliceStartsAt: -1
    };
    for (var i = startIndex; i >= 0; i--) {
        if (!predicate(arr[i])) {
            break;
        }
        result.sliceStartsAt = i;
        result.elements.unshift(arr[i]);
    }
    return result;
}
exports.sliceFromReverseWhile = sliceFromReverseWhile;
;
function intersperse(arr, item) {
    return arr.reduce(function (pv, v, index) {
        pv.push(v);
        if (index < (arr.length - 1)) {
            pv.push(item);
        }
        return pv;
    }, []);
}
exports.intersperse = intersperse;

},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function assign(target) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
    }
    var to = Object(target);
    for (var index = 0; index < sources.length; index++) {
        var nextSource = sources[index];
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

},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function tokenizeWithNewLines(str) {
    var NewLine = "\n";
    if (str === NewLine) {
        return [str];
    }
    var lines = str.split(NewLine);
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
}
exports.tokenizeWithNewLines = tokenizeWithNewLines;
;

},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sanitize(str) {
    var val = str;
    val = val.replace(/^\s*/gm, '');
    var whiteList = /^((https?|s?ftp|file|blob|mailto|tel):|#|\/|data:image\/)/;
    if (whiteList.test(val)) {
        return val;
    }
    return 'unsafe:' + val;
}
exports.sanitize = sanitize;

},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var OpAttributeSanitizer_1 = require("./../OpAttributeSanitizer");
var MentionSanitizer = (function () {
    function MentionSanitizer() {
    }
    MentionSanitizer.sanitize = function (dirtyObj, sanitizeOptions) {
        var cleanObj = {};
        if (!dirtyObj || typeof dirtyObj !== 'object') {
            return cleanObj;
        }
        if (dirtyObj.class && MentionSanitizer.IsValidClass(dirtyObj.class)) {
            cleanObj.class = dirtyObj.class;
        }
        if (dirtyObj.id && MentionSanitizer.IsValidId(dirtyObj.id)) {
            cleanObj.id = dirtyObj.id;
        }
        if (MentionSanitizer.IsValidTarget(dirtyObj.target + '')) {
            cleanObj.target = dirtyObj.target;
        }
        if (dirtyObj.avatar) {
            cleanObj.avatar = OpAttributeSanitizer_1.OpAttributeSanitizer.sanitizeLinkUsingOptions(dirtyObj.avatar + '', sanitizeOptions);
        }
        if (dirtyObj['end-point']) {
            cleanObj['end-point'] = OpAttributeSanitizer_1.OpAttributeSanitizer.sanitizeLinkUsingOptions(dirtyObj['end-point'] + '', sanitizeOptions);
        }
        if (dirtyObj.slug) {
            cleanObj.slug = (dirtyObj.slug + '');
        }
        return cleanObj;
    };
    MentionSanitizer.IsValidClass = function (classAttr) {
        return !!classAttr.match(/^[a-zA-Z0-9_\-]{1,500}$/i);
    };
    MentionSanitizer.IsValidId = function (idAttr) {
        return !!idAttr.match(/^[a-zA-Z0-9_\-\:\.]{1,500}$/i);
    };
    MentionSanitizer.IsValidTarget = function (target) {
        return ['_self', '_blank', '_parent', '_top'].indexOf(target) > -1;
    };
    return MentionSanitizer;
}());
exports.MentionSanitizer = MentionSanitizer;

},{"./../OpAttributeSanitizer":5}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NewLine = "\n";
exports.NewLine = NewLine;
var ListType;
(function (ListType) {
    ListType["Ordered"] = "ordered";
    ListType["Bullet"] = "bullet";
    ListType["Checked"] = "checked";
    ListType["Unchecked"] = "unchecked";
})(ListType || (ListType = {}));
exports.ListType = ListType;
var ScriptType;
(function (ScriptType) {
    ScriptType["Sub"] = "sub";
    ScriptType["Super"] = "super";
})(ScriptType || (ScriptType = {}));
exports.ScriptType = ScriptType;
var DirectionType;
(function (DirectionType) {
    DirectionType["Rtl"] = "rtl";
})(DirectionType || (DirectionType = {}));
exports.DirectionType = DirectionType;
var AlignType;
(function (AlignType) {
    AlignType["Center"] = "center";
    AlignType["Right"] = "right";
    AlignType["Justify"] = "justify";
})(AlignType || (AlignType = {}));
exports.AlignType = AlignType;
var DataType;
(function (DataType) {
    DataType["Image"] = "image";
    DataType["Video"] = "video";
    DataType["Formula"] = "formula";
    DataType["Text"] = "text";
})(DataType || (DataType = {}));
exports.DataType = DataType;
;
var GroupType;
(function (GroupType) {
    GroupType["Block"] = "block";
    GroupType["InlineGroup"] = "inline-group";
    GroupType["List"] = "list";
    GroupType["Video"] = "video";
})(GroupType || (GroupType = {}));
exports.GroupType = GroupType;
;

},{}]},{},[7])(7)
});
; window.QuillDeltaToHtmlConverter = window.QuillDeltaToHtmlConverter ? window.QuillDeltaToHtmlConverter.QuillDeltaToHtmlConverter : window.QuillDeltaToHtmlConverter; 
