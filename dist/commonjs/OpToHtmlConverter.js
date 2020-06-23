"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var funcs_html_1 = require("./funcs-html");
var value_types_1 = require("./value-types");
var obj = __importStar(require("./helpers/object"));
var arr = __importStar(require("./helpers/array"));
var OpAttributeSanitizer_1 = require("./OpAttributeSanitizer");
var DEFAULT_INLINE_FONTS = {
    serif: 'font-family: Georgia, Times New Roman, serif',
    monospace: 'font-family: Monaco, Courier New, monospace',
};
exports.DEFAULT_INLINE_STYLES = {
    font: function (value) { return DEFAULT_INLINE_FONTS[value] || 'font-family:' + value; },
    size: {
        small: 'font-size: 0.75em',
        large: 'font-size: 1.5em',
        huge: 'font-size: 2.5em',
    },
    indent: function (value, op) {
        var indentSize = parseInt(value, 10) * 3;
        var side = op.attributes['direction'] === 'rtl' ? 'right' : 'left';
        return 'padding-' + side + ':' + indentSize + 'em';
    },
    direction: function (value, op) {
        if (value === 'rtl') {
            return ('direction:rtl' + (op.attributes['align'] ? '' : '; text-align:inherit'));
        }
        else {
            return undefined;
        }
    },
};
var OpToHtmlConverter = (function () {
    function OpToHtmlConverter(op, options) {
        this.op = op;
        this.options = obj.assign({}, {
            classPrefix: 'ql',
            inlineStyles: undefined,
            encodeHtml: true,
            listItemTag: 'li',
            paragraphTag: 'p',
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
        var imgTag = 'img';
        var isImageLink = function (tag) {
            return tag === imgTag && !!_this.op.attributes.link;
        };
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
            closingTag: endTags.join(''),
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
        return (this.options.encodeHtml && funcs_html_1.encodeHtml(content)) || content;
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
        return (this.getCustomCssClasses() || []).concat(propsArr
            .filter(function (prop) { return !!attrs[prop]; })
            .filter(function (prop) {
            return prop === 'background'
                ? OpAttributeSanitizer_1.OpAttributeSanitizer.IsValidColorLiteral(attrs[prop])
                : true;
        })
            .map(function (prop) { return prop + '-' + attrs[prop]; })
            .concat(this.op.isFormula() ? 'formula' : [])
            .concat(this.op.isVideo() ? 'video' : [])
            .concat(this.op.isImage() ? 'image' : [])
            .map(this.prefixClass.bind(this)));
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
                ['size'],
            ]);
        }
        return (this.getCustomCssStyles() || [])
            .concat(propsArr
            .filter(function (item) { return !!attrs[item[0]]; })
            .map(function (item) {
            var attribute = item[0];
            var attrValue = attrs[attribute];
            var attributeConverter = (_this.options.inlineStyles &&
                _this.options.inlineStyles[attribute]) ||
                exports.DEFAULT_INLINE_STYLES[attribute];
            if (typeof attributeConverter === 'object') {
                return attributeConverter[attrValue];
            }
            else if (typeof attributeConverter === 'function') {
                var converterFn = attributeConverter;
                return converterFn(attrValue, _this.op);
            }
            else {
                return arr.preferSecond(item) + ':' + attrValue;
            }
        }))
            .filter(function (item) { return item !== undefined; });
    };
    OpToHtmlConverter.prototype.getTagAttributes = function () {
        if (this.op.attributes.code && !this.op.isLink()) {
            return [];
        }
        var makeAttr = this.makeAttr.bind(this);
        var customTagAttributes = this.getCustomTagAttributes();
        var customAttr = customTagAttributes
            ? Object.keys(this.getCustomTagAttributes()).map(function (k) {
                return makeAttr(k, customTagAttributes[k]);
            })
            : [];
        var classes = this.getCssClasses();
        var tagAttrs = classes.length
            ? customAttr.concat([makeAttr('class', classes.join(' '))])
            : customAttr;
        if (this.op.isImage()) {
            this.op.attributes.width &&
                (tagAttrs = tagAttrs.concat(makeAttr('width', this.op.attributes.width)));
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
        if (this.op.isCodeBlock() &&
            typeof this.op.attributes['code-block'] === 'string') {
            return tagAttrs.concat(makeAttr('data-language', this.op.attributes['code-block']));
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
        var targetForAll = OpAttributeSanitizer_1.OpAttributeSanitizer.isValidTarget(this.options.linkTarget || '')
            ? this.options.linkTarget
            : undefined;
        var relForAll = OpAttributeSanitizer_1.OpAttributeSanitizer.IsValidRel(this.options.linkRel || '')
            ? this.options.linkRel
            : undefined;
        var target = this.op.attributes.target || targetForAll;
        var rel = this.op.attributes.rel || relForAll;
        return tagAttrs
            .concat(this.makeAttr('href', this.op.attributes.link))
            .concat(target ? this.makeAttr('target', target) : [])
            .concat(rel ? this.makeAttr('rel', rel) : []);
    };
    OpToHtmlConverter.prototype.getCustomTag = function (format) {
        if (this.options.customTag &&
            typeof this.options.customTag === 'function') {
            return this.options.customTag.apply(null, [format, this.op]);
        }
    };
    OpToHtmlConverter.prototype.getCustomTagAttributes = function () {
        if (this.options.customTagAttributes &&
            typeof this.options.customTagAttributes === 'function') {
            return this.options.customTagAttributes.apply(null, [this.op]);
        }
    };
    OpToHtmlConverter.prototype.getCustomCssClasses = function () {
        if (this.options.customCssClasses &&
            typeof this.options.customCssClasses === 'function') {
            var res = this.options.customCssClasses.apply(null, [this.op]);
            if (res) {
                return Array.isArray(res) ? res : [res];
            }
        }
    };
    OpToHtmlConverter.prototype.getCustomCssStyles = function () {
        if (this.options.customCssStyles &&
            typeof this.options.customCssStyles === 'function') {
            var res = this.options.customCssStyles.apply(null, [this.op]);
            if (res) {
                return Array.isArray(res) ? res : [res];
            }
        }
    };
    OpToHtmlConverter.prototype.getTags = function () {
        var _this = this;
        var attrs = this.op.attributes;
        if (!this.op.isText()) {
            return [
                this.op.isVideo() ? 'iframe' : this.op.isImage() ? 'img' : 'span',
            ];
        }
        var positionTag = this.options.paragraphTag || 'p';
        var blocks = [
            ['blockquote'],
            ['code-block', 'pre'],
            ['list', this.options.listItemTag],
            ['header'],
            ['align', positionTag],
            ['direction', positionTag],
            ['indent', positionTag],
        ];
        for (var _i = 0, blocks_1 = blocks; _i < blocks_1.length; _i++) {
            var item = blocks_1[_i];
            var firstItem = item[0];
            if (attrs[firstItem]) {
                var customTag = this.getCustomTag(firstItem);
                return customTag
                    ? [customTag]
                    : firstItem === 'header'
                        ? ['h' + attrs[firstItem]]
                        : [arr.preferSecond(item)];
            }
        }
        if (this.op.isCustomTextBlock()) {
            var customTag = this.getCustomTag('renderAsBlock');
            return customTag ? [customTag] : [positionTag];
        }
        var customTagsMap = Object.keys(attrs).reduce(function (res, it) {
            var customTag = _this.getCustomTag(it);
            if (customTag) {
                res[it] = customTag;
            }
            return res;
        }, {});
        var inlineTags = [
            ['link', 'a'],
            ['mentions', 'a'],
            ['script'],
            ['bold', 'strong'],
            ['italic', 'em'],
            ['strike', 's'],
            ['underline', 'u'],
            ['code'],
        ];
        return inlineTags.filter(function (item) { return !!attrs[item[0]]; }).concat(Object.keys(customTagsMap)
            .filter(function (t) { return !inlineTags.some(function (it) { return it[0] == t; }); })
            .map(function (t) { return [t, customTagsMap[t]]; })).map(function (item) {
            return customTagsMap[item[0]]
                ? customTagsMap[item[0]]
                : item[0] === 'script'
                    ? attrs[item[0]] === value_types_1.ScriptType.Sub
                        ? 'sub'
                        : 'sup'
                    : arr.preferSecond(item);
        });
    };
    return OpToHtmlConverter;
}());
exports.OpToHtmlConverter = OpToHtmlConverter;
