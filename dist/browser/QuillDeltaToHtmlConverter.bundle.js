(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.QuillDeltaToHtmlConverter = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var value_types_1 = require("./value-types");
var InsertData_1 = require("./InsertData");
var DeltaInsertOp = (function () {
    function DeltaInsertOp(insertVal, attributes) {
        if (typeof insertVal === 'string') {
            insertVal = new InsertData_1.InsertDataQuill(value_types_1.DataType.Text, insertVal + '');
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
    DeltaInsertOp.prototype.hasSameIndentationAs = function (op) {
        return this.attributes.indent === op.attributes.indent;
    };
    DeltaInsertOp.prototype.hasHigherIndentThan = function (op) {
        return (Number(this.attributes.indent) || 0) > (Number(op.attributes.indent) || 0);
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
    DeltaInsertOp.prototype.isCustom = function () {
        return this.insert instanceof InsertData_1.InsertDataCustom;
    };
    DeltaInsertOp.prototype.isMentions = function () {
        return this.isText() && !!this.attributes.mentions;
    };
    return DeltaInsertOp;
}());
exports.DeltaInsertOp = DeltaInsertOp;

},{"./InsertData":2,"./value-types":16}],2:[function(require,module,exports){
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

},{"./extensions/Object":9,"./extensions/String":10,"./value-types":16}],4:[function(require,module,exports){
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
            new InsertData_1.InsertDataQuill(value_types_1.DataType.Image, insertPropVal[value_types_1.DataType.Image])
            : value_types_1.DataType.Video in insertPropVal ?
                new InsertData_1.InsertDataQuill(value_types_1.DataType.Video, insertPropVal[value_types_1.DataType.Video])
                : value_types_1.DataType.Formula in insertPropVal ?
                    new InsertData_1.InsertDataQuill(value_types_1.DataType.Formula, insertPropVal[value_types_1.DataType.Formula])
                    : new InsertData_1.InsertDataCustom(keys[0], insertPropVal[keys[0]]);
    };
    return InsertOpsConverter;
}());
exports.InsertOpsConverter = InsertOpsConverter;

},{"./DeltaInsertOp":1,"./InsertData":2,"./InsertOpDenormalizer":3,"./OpAttributeSanitizer":5,"./value-types":16}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var value_types_1 = require("./value-types");
var MentionSanitizer_1 = require("./mentions/MentionSanitizer");
require("./extensions/String");
var OpAttributeSanitizer = (function () {
    function OpAttributeSanitizer() {
    }
    OpAttributeSanitizer.sanitize = function (dirtyAttrs) {
        var cleanAttrs = {};
        if (!dirtyAttrs || typeof dirtyAttrs !== 'object') {
            return cleanAttrs;
        }
        var booleanAttrs = [
            'bold', 'italic', 'underline', 'strike', 'code',
            'blockquote', 'code-block'
        ];
        var colorAttrs = ['background', 'color'];
        var font = dirtyAttrs.font, size = dirtyAttrs.size, link = dirtyAttrs.link, script = dirtyAttrs.script, list = dirtyAttrs.list, header = dirtyAttrs.header, align = dirtyAttrs.align, direction = dirtyAttrs.direction, indent = dirtyAttrs.indent, mentions = dirtyAttrs.mentions, mention = dirtyAttrs.mention, width = dirtyAttrs.width;
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
                OpAttributeSanitizer.IsValidColorLiteral(val + ''))) {
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
            cleanAttrs.link = (link + '')._scrubUrl();
        }
        if (script === value_types_1.ScriptType.Sub || value_types_1.ScriptType.Super === script) {
            cleanAttrs.script = script;
        }
        if (list === value_types_1.ListType.Bullet || list === value_types_1.ListType.Ordered) {
            cleanAttrs.list = list;
        }
        if (Number(header)) {
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
        if (mentions && mention) {
            var sanitizedMention = MentionSanitizer_1.MentionSanitizer.sanitize(mention);
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
    OpAttributeSanitizer.IsValidHexColor = function (colorStr) {
        return !!colorStr.match(/^#([0-9A-F]{6}|[0-9A-F]{3})$/i);
    };
    OpAttributeSanitizer.IsValidColorLiteral = function (colorStr) {
        return !!colorStr.match(/^[a-z]{1,50}$/i);
    };
    OpAttributeSanitizer.IsValidFontName = function (fontName) {
        return !!fontName.match(/^[a-z\s0-9\- ]{1,30}$/i);
    };
    OpAttributeSanitizer.IsValidSize = function (size) {
        return !!size.match(/^[a-z\-]{1,20}$/i);
    };
    OpAttributeSanitizer.IsValidWidth = function (width) {
        return !!width.match(/^[0-9]*(px|em|%)?$/);
    };
    return OpAttributeSanitizer;
}());
exports.OpAttributeSanitizer = OpAttributeSanitizer;

},{"./extensions/String":10,"./mentions/MentionSanitizer":15,"./value-types":16}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var funcs_html_1 = require("./funcs-html");
var value_types_1 = require("./value-types");
require("./extensions/String");
require("./extensions/Object");
require("./extensions/Array");
var OpAttributeSanitizer_1 = require("./OpAttributeSanitizer");
var OpToHtmlConverter = (function () {
    function OpToHtmlConverter(op, options) {
        this.op = op;
        this.options = Object._assign({}, {
            classPrefix: 'ql',
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
        if (this.op.isJustNewline() && !this.op.isContainerBlock()) {
            return { openingTag: '', closingTag: '', content: value_types_1.NewLine };
        }
        var tags = this.getTags(), attrs = this.getTagAttributes();
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
        var attrs = this.op.attributes;
        var propsArr = [['color']];
        if (!this.options.allowBackgroundClasses) {
            propsArr.push(['background', 'background-color']);
        }
        return propsArr
            .filter(function (item) { return !!attrs[item[0]]; })
            .map(function (item) { return item._preferSecond() + ':' + attrs[item[0]]; });
    };
    OpToHtmlConverter.prototype.getTagAttributes = function () {
        if (this.op.attributes.code) {
            return [];
        }
        var makeAttr = function (k, v) { return ({ key: k, value: v }); };
        var classes = this.getCssClasses();
        var tagAttrs = classes.length ? [makeAttr('class', classes.join(' '))] : [];
        if (this.op.isImage()) {
            this.op.attributes.width && (tagAttrs = tagAttrs.concat(makeAttr('width', this.op.attributes.width)));
            return tagAttrs.concat(makeAttr('src', (this.op.insert.value + '')._scrubUrl()));
        }
        if (this.op.isFormula() || this.op.isContainerBlock()) {
            return tagAttrs;
        }
        if (this.op.isVideo()) {
            return tagAttrs.concat(makeAttr('frameborder', '0'), makeAttr('allowfullscreen', 'true'), makeAttr('src', (this.op.insert.value + '')._scrubUrl()));
        }
        if (this.op.isMentions()) {
            var mention = this.op.attributes.mention;
            if (mention.class) {
                tagAttrs = tagAttrs.concat(makeAttr('class', mention.class));
            }
            if (mention['end-point'] && mention.slug) {
                tagAttrs = tagAttrs.concat(makeAttr('href', funcs_html_1.encodeLink(mention['end-point'] + '/' + mention.slug)));
            }
            else {
                tagAttrs = tagAttrs.concat(makeAttr('href', 'javascript:void(0)'));
            }
            if (mention.target) {
                tagAttrs = tagAttrs.concat(makeAttr('target', mention.target));
            }
            return tagAttrs;
        }
        var styles = this.getCssStyles();
        var styleAttr = styles.length ? [makeAttr('style', styles.join(';'))] : [];
        tagAttrs = tagAttrs
            .concat(styleAttr)
            .concat(this.op.isLink() ? [
            makeAttr('href', funcs_html_1.encodeLink(this.op.attributes.link)),
            makeAttr('target', '_blank')
        ] : []);
        if (this.op.isLink() && !!this.options.linkRel && OpToHtmlConverter.IsValidRel(this.options.linkRel)) {
            tagAttrs.push(makeAttr('rel', this.options.linkRel));
        }
        return tagAttrs;
    };
    OpToHtmlConverter.prototype.getTags = function () {
        var attrs = this.op.attributes;
        if (attrs.code) {
            return ['code'];
        }
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
            if (attrs[item[0]]) {
                return item[0] === 'header' ? ['h' + attrs[item[0]]] : [item._preferSecond()];
            }
        }
        return [['link', 'a'], ['script'],
            ['bold', 'strong'], ['italic', 'em'], ['strike', 's'], ['underline', 'u'],
            ['mentions', 'a']]
            .filter(function (item) { return !!attrs[item[0]]; })
            .map(function (item) {
            return item[0] === 'script' ?
                (attrs[item[0]] === value_types_1.ScriptType.Sub ? 'sub' : 'sup')
                : item._preferSecond();
        });
    };
    OpToHtmlConverter.IsValidRel = function (relStr) {
        return !!relStr.match(/^[a-z\s]{1,50}$/i);
    };
    return OpToHtmlConverter;
}());
exports.OpToHtmlConverter = OpToHtmlConverter;

},{"./OpAttributeSanitizer":5,"./extensions/Array":8,"./extensions/Object":9,"./extensions/String":10,"./funcs-html":11,"./value-types":16}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InsertOpsConverter_1 = require("./InsertOpsConverter");
var OpToHtmlConverter_1 = require("./OpToHtmlConverter");
var Grouper_1 = require("./grouper/Grouper");
var group_types_1 = require("./grouper/group-types");
var ListNester_1 = require("./grouper/ListNester");
var funcs_html_1 = require("./funcs-html");
require("./extensions/Object");
var value_types_1 = require("./value-types");
var BrTag = '<br/>';
var QuillDeltaToHtmlConverter = (function () {
    function QuillDeltaToHtmlConverter(deltaOps, options) {
        this.rawDeltaOps = [];
        this.callbacks = {};
        this.options = Object._assign({
            paragraphTag: 'p',
            encodeHtml: true,
            classPrefix: 'ql',
            multiLineBlockquote: true,
            multiLineHeader: true,
            multiLineCodeblock: true,
            allowBackgroundClasses: false
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
            linkRel: this.options.linkRel,
            allowBackgroundClasses: this.options.allowBackgroundClasses
        };
        this.rawDeltaOps = deltaOps;
    }
    QuillDeltaToHtmlConverter.prototype.getListTag = function (op) {
        return op.isOrderedList() ? this.options.orderedListTag + ''
            : op.isBulletList() ? this.options.bulletListTag + ''
                : '';
    };
    QuillDeltaToHtmlConverter.prototype.getGroupedOps = function () {
        var deltaOps = InsertOpsConverter_1.InsertOpsConverter.convert(this.rawDeltaOps);
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
        return this.getGroupedOps()
            .map(function (group) {
            if (group instanceof group_types_1.ListGroup) {
                return _this.renderWithCallbacks(value_types_1.GroupType.List, group, function () { return _this.renderList(group); });
            }
            else if (group instanceof group_types_1.BlockGroup) {
                var g = group;
                return _this.renderWithCallbacks(value_types_1.GroupType.Block, group, function () { return _this.renderBlock(g.op, g.ops); });
            }
            else if (group instanceof group_types_1.VideoItem) {
                return _this.renderWithCallbacks(value_types_1.GroupType.Video, group, function () {
                    var g = group;
                    var converter = new OpToHtmlConverter_1.OpToHtmlConverter(g.op, _this.converterOptions);
                    return converter.getHtml();
                });
            }
            else {
                return _this.renderWithCallbacks(value_types_1.GroupType.InlineGroup, group, function () {
                    return _this.renderInlines(group.ops);
                });
            }
        })
            .join("");
    };
    QuillDeltaToHtmlConverter.prototype.renderWithCallbacks = function (groupType, group, myRenderFn) {
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
    QuillDeltaToHtmlConverter.prototype.renderList = function (list, isOuterMost) {
        var _this = this;
        if (isOuterMost === void 0) { isOuterMost = true; }
        var firstItem = list.items[0];
        return funcs_html_1.makeStartTag(this.getListTag(firstItem.item.op))
            + list.items.map(function (li) { return _this.renderListItem(li, isOuterMost); }).join('')
            + funcs_html_1.makeEndTag(this.getListTag(firstItem.item.op));
    };
    QuillDeltaToHtmlConverter.prototype.renderListItem = function (li, isOuterMost) {
        var converterOptions = Object._assign({}, this.converterOptions);
        li.item.op.attributes.indent = 0;
        var converter = new OpToHtmlConverter_1.OpToHtmlConverter(li.item.op, this.converterOptions);
        var parts = converter.getHtmlParts();
        var liElementsHtml = this.renderInlines(li.item.ops, false);
        return parts.openingTag + (liElementsHtml) +
            (li.innerList ? this.renderList(li.innerList, false) : '')
            + parts.closingTag;
    };
    QuillDeltaToHtmlConverter.prototype.renderBlock = function (bop, ops) {
        var _this = this;
        var converter = new OpToHtmlConverter_1.OpToHtmlConverter(bop, this.converterOptions);
        var htmlParts = converter.getHtmlParts();
        if (bop.isCodeBlock()) {
            return htmlParts.openingTag +
                ops.map(function (iop) {
                    return iop.isCustom() ? _this.renderCustom(iop, bop) : iop.insert.value;
                }).join("")
                + htmlParts.closingTag;
        }
        var inlines = ops.map(function (op) { return _this._renderInline(op, bop); }).join('');
        return htmlParts.openingTag + (inlines || BrTag) + htmlParts.closingTag;
    };
    QuillDeltaToHtmlConverter.prototype.renderInlines = function (ops, wrapInParagraphTag) {
        var _this = this;
        if (wrapInParagraphTag === void 0) { wrapInParagraphTag = true; }
        var opsLen = ops.length - 1;
        var html = ops.map(function (op, i) {
            if (i > 0 && i === opsLen && op.isJustNewline()) {
                return '';
            }
            return _this._renderInline(op, null);
        }).join('');
        if (!wrapInParagraphTag) {
            return html;
        }
        return funcs_html_1.makeStartTag(this.options.paragraphTag) +
            html + funcs_html_1.makeEndTag(this.options.paragraphTag);
    };
    QuillDeltaToHtmlConverter.prototype._renderInline = function (op, contextOp) {
        if (op.isCustom()) {
            return this.renderCustom(op, contextOp);
        }
        var converter = new OpToHtmlConverter_1.OpToHtmlConverter(op, this.converterOptions);
        return converter.getHtml().replace(/\n/g, BrTag);
    };
    QuillDeltaToHtmlConverter.prototype.renderCustom = function (op, contextOp) {
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

},{"./InsertOpsConverter":4,"./OpToHtmlConverter":6,"./extensions/Object":9,"./funcs-html":11,"./grouper/Grouper":12,"./grouper/ListNester":13,"./grouper/group-types":14,"./value-types":16}],8:[function(require,module,exports){
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
Array.prototype._intersperse = function (item) {
    var _this = this;
    return this.reduce(function (pv, v, index) {
        pv.push(v);
        if (index < (_this.length - 1)) {
            pv.push(item);
        }
        return pv;
    }, []);
};

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EncodeTarget;
(function (EncodeTarget) {
    EncodeTarget[EncodeTarget["Html"] = 0] = "Html";
    EncodeTarget[EncodeTarget["Url"] = 1] = "Url";
})(EncodeTarget || (EncodeTarget = {}));
function makeStartTag(tag, attrs) {
    if (attrs === void 0) { attrs = null; }
    if (!tag) {
        return '';
    }
    var attrsStr = '';
    if (attrs) {
        attrs = [].concat(attrs);
        attrsStr = attrs.map(function (attr) {
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
            return v.indexOf('(') === -1 || v.indexOf(')') === -1;
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

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DeltaInsertOp_1 = require("./../DeltaInsertOp");
require("./../extensions/Array");
var group_types_1 = require("./group-types");
var Grouper = (function () {
    function Grouper() {
    }
    Grouper.pairOpsWithTheirBlock = function (ops) {
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
                result.push(new group_types_1.VideoItem(op));
            }
            else if (op.isContainerBlock()) {
                opsSlice = ops._sliceFromReverseWhile(i - 1, canBeInBlock);
                result.push(new group_types_1.BlockGroup(op, opsSlice.elements));
                i = opsSlice.sliceStartsAt > -1 ? opsSlice.sliceStartsAt : i;
            }
            else {
                opsSlice = ops._sliceFromReverseWhile(i - 1, isInlineData);
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
        return groups._groupConsecutiveElementsWhile(function (g, gPrev) {
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
            elm[0].ops = elm.map(function (g, i) {
                if (!g.ops.length) {
                    return [newLineOp];
                }
                return g.ops.concat(i < groupsLastInd ? [newLineOp] : []);
            })._flatten();
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

},{"./../DeltaInsertOp":1,"./../extensions/Array":8,"./group-types":14}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var group_types_1 = require("./group-types");
var ListNester = (function () {
    function ListNester() {
    }
    ListNester.prototype.nest = function (groups) {
        var _this = this;
        var result = [];
        var listBlocked = this.convertListBlocksToListGroups(groups);
        var groupedByListGroups = this.groupConsecutiveListGroups(listBlocked);
        var nested = groupedByListGroups.map(function (group) {
            if (!Array.isArray(group)) {
                return group;
            }
            return _this.nestListSection(group);
        })
            ._flatten();
        var groupRootLists = nested._groupConsecutiveElementsWhile(function (curr, prev) {
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
            return new group_types_1.ListGroup(litems._flatten());
        });
    };
    ListNester.prototype.convertListBlocksToListGroups = function (items) {
        var grouped = items._groupConsecutiveElementsWhile(function (g, gPrev) {
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
        return items._groupConsecutiveElementsWhile(function (curr, prev) {
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

},{"./group-types":14}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InlineGroup = (function () {
    function InlineGroup(ops) {
        this.ops = ops;
    }
    return InlineGroup;
}());
exports.InlineGroup = InlineGroup;
var VideoItem = (function () {
    function VideoItem(op) {
        this.op = op;
    }
    return VideoItem;
}());
exports.VideoItem = VideoItem;
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

},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./../extensions/String");
var MentionSanitizer = (function () {
    function MentionSanitizer() {
    }
    MentionSanitizer.sanitize = function (dirtyObj) {
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
        if (MentionSanitizer.IsValidTarget(dirtyObj.target)) {
            cleanObj.target = dirtyObj.target;
        }
        if (dirtyObj.avatar) {
            cleanObj.avatar = (dirtyObj.avatar + '')._scrubUrl();
        }
        if (dirtyObj['end-point']) {
            cleanObj['end-point'] = (dirtyObj['end-point'] + '')._scrubUrl();
        }
        if (dirtyObj.slug) {
            cleanObj.slug = (dirtyObj.slug + '')._scrubUrl();
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

},{"./../extensions/String":10}],16:[function(require,module,exports){
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
var GroupType = {
    Block: 'block',
    InlineGroup: 'inline-group',
    List: 'list',
    Video: 'video'
};
exports.GroupType = GroupType;

},{}]},{},[7])(7)
});; window.QuillDeltaToHtmlConverter = window.QuillDeltaToHtmlConverter.QuillDeltaToHtmlConverter; 
