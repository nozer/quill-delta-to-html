"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var funcs_html_1 = require("./funcs-html");
var value_types_1 = require("./value-types");
var url = require("./helpers/url");
var obj = require("./helpers/object");
var arr = require("./helpers/array");
var OpAttributeSanitizer_1 = require("./OpAttributeSanitizer");
var OpToHtmlConverter = (function () {
    function OpToHtmlConverter(op, options) {
        this.op = op;
        this.options = obj.assign({}, {
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
            .map(function (item) { return arr.preferSecond(item) + ':' + attrs[item[0]]; });
    };
    OpToHtmlConverter.prototype.getTagAttributes = function () {
        if (this.op.attributes.code && !this.op.isLink()) {
            return [];
        }
        var makeAttr = function (k, v) { return ({ key: k, value: v }); };
        var classes = this.getCssClasses();
        var tagAttrs = classes.length ? [makeAttr('class', classes.join(' '))] : [];
        if (this.op.isImage()) {
            this.op.attributes.width && (tagAttrs = tagAttrs.concat(makeAttr('width', this.op.attributes.width)));
            return tagAttrs.concat(makeAttr('src', url.sanitize(this.op.insert.value + '') + ''));
        }
        if (this.op.isACheckList()) {
            return tagAttrs.concat(makeAttr('data-checked', this.op.isCheckedList() ? 'true' : 'false'));
        }
        if (this.op.isFormula() || this.op.isContainerBlock()) {
            return tagAttrs;
        }
        if (this.op.isVideo()) {
            return tagAttrs.concat(makeAttr('frameborder', '0'), makeAttr('allowfullscreen', 'true'), makeAttr('src', url.sanitize(this.op.insert.value + '') + ''));
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
                tagAttrs = tagAttrs.concat(makeAttr('href', 'about:blank'));
            }
            if (mention.target) {
                tagAttrs = tagAttrs.concat(makeAttr('target', mention.target));
            }
            return tagAttrs;
        }
        var styles = this.getCssStyles();
        var styleAttr = styles.length ? [makeAttr('style', styles.join(';'))] : [];
        tagAttrs = tagAttrs.concat(styleAttr);
        if (this.op.isLink()) {
            var target = this.op.attributes.target || this.options.linkTarget;
            tagAttrs = tagAttrs
                .concat(makeAttr('href', funcs_html_1.encodeLink(this.op.attributes.link)))
                .concat(target ? makeAttr('target', target) : []);
            if (!!this.options.linkRel && OpToHtmlConverter.IsValidRel(this.options.linkRel)) {
                tagAttrs.push(makeAttr('rel', this.options.linkRel));
            }
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
