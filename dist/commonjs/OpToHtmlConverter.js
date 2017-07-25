"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var funcs_html_1 = require("./funcs-html");
var value_types_1 = require("./value-types");
require("./extensions/String");
require("./extensions/Object");
require("./extensions/Array");
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
        return ['indent', 'align', 'direction', 'font', 'size']
            .filter(function (prop) { return !!attrs[prop]; })
            .map(function (prop) { return prop + '-' + attrs[prop]; })
            .concat(this.op.isFormula() ? 'formula' : [])
            .concat(this.op.isVideo() ? 'video' : [])
            .concat(this.op.isImage() ? 'image' : [])
            .map(this.prefixClass.bind(this));
    };
    OpToHtmlConverter.prototype.getCssStyles = function () {
        var attrs = this.op.attributes;
        return [['background', 'background-color'], ['color']]
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
            return tagAttrs.concat(makeAttr('src', (this.op.insert.value + '')._scrubUrl()));
        }
        if (this.op.isFormula() || this.op.isContainerBlock()) {
            return tagAttrs;
        }
        if (this.op.isVideo()) {
            return tagAttrs.concat(makeAttr('frameborder', '0'), makeAttr('allowfullscreen', 'true'), makeAttr('src', (this.op.insert.value + '')._scrubUrl()));
        }
        if (this.op.isMentions()) {
            return tagAttrs.concat(makeAttr('class', 'custom-em'), makeAttr('href', 'javascript:void(0)'));
        }
        var styles = this.getCssStyles();
        var styleAttr = styles.length ? [makeAttr('style', styles.join(';'))] : [];
        return tagAttrs
            .concat(styleAttr)
            .concat(this.op.isLink() ? [makeAttr('href', this.op.attributes.link),
            makeAttr('target', '_blank')] : []);
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
    return OpToHtmlConverter;
}());
exports.OpToHtmlConverter = OpToHtmlConverter;
