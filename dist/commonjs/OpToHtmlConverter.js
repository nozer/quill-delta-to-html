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
