"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var funcs_html_1 = require("./funcs-html");
var value_types_1 = require("./value-types");
var funcs_misc_1 = require("./funcs-misc");
var OpToHtmlConverter = (function () {
    function OpToHtmlConverter(op, options) {
        this._cssClasses = null;
        this._cssStyles = null;
        this.op = op;
        this.options = Object.assign({}, {
            classPrefix: 'ql',
            encodeHtml: true
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
        return parts.opening + parts.content + parts.closing;
    };
    OpToHtmlConverter.prototype.getHtmlParts = function () {
        if (this.op.isNewLine() && !this.op.isContainerBlock()) {
            return { opening: '<br />', closing: '', content: '' };
        }
        var tags = this.getTags(), attrs = this.getTagAttributes();
        var beginTags = [], endTags = [];
        var isAttrsConsumed = false;
        for (var _i = 0, tags_1 = tags; _i < tags_1.length; _i++) {
            var tag = tags_1[_i];
            beginTags.push(funcs_html_1.makeStartTag(tag, !isAttrsConsumed && attrs || null));
            endTags.push(tag === 'img' ? '' : funcs_html_1.makeEndTag(tag));
            isAttrsConsumed = true;
        }
        endTags.reverse();
        return {
            opening: beginTags.join(''),
            content: this.getContent(),
            closing: endTags.join('')
        };
    };
    OpToHtmlConverter.prototype.getContent = function () {
        if (this.op.isContainerBlock()) {
            return '';
        }
        var content = '';
        if (this.op.isFormula()) {
            content = this.op.insert.value;
        }
        else if (this.op.isText()) {
            content = this.op.insert;
        }
        return this.options.encodeHtml && funcs_html_1.encodeHtml(content) || content;
    };
    OpToHtmlConverter.prototype.getCssClasses = function () {
        if (this._cssClasses !== null) {
            return this._cssClasses;
        }
        var attrs = this.op.attributes;
        return this._cssClasses = ['indent', 'align', 'direction', 'font', 'size']
            .filter(function (prop) { return !!attrs[prop]; })
            .map(function (prop) { return prop + '-' + attrs[prop]; })
            .concat(this.op.isFormula() ? 'formula' : [])
            .concat(this.op.isVideo() ? 'video' : [])
            .concat(this.op.isImage() ? 'image' : [])
            .map(this.prefixClass.bind(this));
    };
    OpToHtmlConverter.prototype.getCssStyles = function () {
        if (this._cssStyles !== null) {
            return this._cssStyles;
        }
        var attrs = this.op.attributes;
        return this._cssStyles = [['background', 'background-color'], ['color']]
            .filter(function (item) { return !!attrs[item[0]]; })
            .map(function (item) { return funcs_misc_1.preferSecond(item) + ':' + attrs[item[0]]; });
    };
    OpToHtmlConverter.prototype.getTagAttributes = function () {
        if (this.op.attributes.code) {
            return [];
        }
        var makeAttr = function (k, v) { return ({ key: k, value: v }); };
        var classes = this.getCssClasses();
        var tagAttrs = classes.length ? [makeAttr('class', classes.join(' '))] : [];
        if (this.op.isImage()) {
            return tagAttrs.concat(makeAttr('src', this.op.insert.value));
        }
        if (this.op.isFormula() || this.op.isContainerBlock()) {
            return tagAttrs;
        }
        if (this.op.isVideo()) {
            return tagAttrs.concat(makeAttr('frameborder', '0'), makeAttr('allowfullscreen', 'true'), makeAttr('src', this.op.insert.value));
        }
        var styles = this.getCssStyles();
        var styleAttr = styles.length ? [makeAttr('style', styles.join(';'))] : [];
        return tagAttrs
            .concat(styleAttr)
            .concat(this.op.isLink() ? makeAttr('href', this.op.attributes.link) : []);
    };
    OpToHtmlConverter.prototype.getTags = function () {
        var attrs = this.op.attributes;
        if (attrs.code) {
            return ['code'];
        }
        if (this.op.isEmbed()) {
            return [this.op.isVideo() ? 'iframe'
                    : this.op.isImage() ? 'img'
                        : this.op.isFormula() ? 'span'
                            : 'unknown'
            ];
        }
        var blocks = [['blockquote'], ['code-block', 'pre'], ['list', 'li'], ['header']];
        for (var _i = 0, blocks_1 = blocks; _i < blocks_1.length; _i++) {
            var item = blocks_1[_i];
            if (attrs[item[0]]) {
                return item[0] === 'header' ? ['h' + attrs[item[0]]] : [funcs_misc_1.preferSecond(item)];
            }
        }
        var inlineTags = [['link', 'a'], ['script'],
            ['bold', 'strong'], ['italic', 'em'], ['strike', 's'], ['underline', 'u']
        ]
            .filter(function (item) { return !!attrs[item[0]]; })
            .map(function (item) {
            return item[0] === 'script' ?
                (attrs[item[0]] === value_types_1.ScriptType.Sub ? 'sub' : 'sup')
                : funcs_misc_1.preferSecond(item);
        });
        if (!inlineTags.length &&
            (this.getCssStyles().length || this.getCssClasses().length)) {
            return ['span'];
        }
        return inlineTags;
    };
    return OpToHtmlConverter;
}());
exports.OpToHtmlConverter = OpToHtmlConverter;
