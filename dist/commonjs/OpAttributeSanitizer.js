"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var value_types_1 = require("./value-types");
var MentionSanitizer_1 = require("./mentions/MentionSanitizer");
var array_1 = require("./helpers/array");
var OpLinkSanitizer_1 = require("./OpLinkSanitizer");
var OpAttributeSanitizer = (function () {
    function OpAttributeSanitizer() {
    }
    OpAttributeSanitizer.sanitize = function (dirtyAttrs, sanitizeOptions) {
        var cleanAttrs = {};
        if (!dirtyAttrs || typeof dirtyAttrs !== 'object') {
            return cleanAttrs;
        }
        var booleanAttrs = [
            'bold',
            'italic',
            'underline',
            'strike',
            'code',
            'blockquote',
            'code-block',
            'renderAsBlock',
        ];
        var colorAttrs = ['background', 'color'];
        var font = dirtyAttrs.font, size = dirtyAttrs.size, link = dirtyAttrs.link, script = dirtyAttrs.script, list = dirtyAttrs.list, header = dirtyAttrs.header, align = dirtyAttrs.align, direction = dirtyAttrs.direction, indent = dirtyAttrs.indent, mentions = dirtyAttrs.mentions, mention = dirtyAttrs.mention, width = dirtyAttrs.width, target = dirtyAttrs.target, rel = dirtyAttrs.rel;
        var codeBlock = dirtyAttrs['code-block'];
        var sanitizedAttrs = booleanAttrs.concat(colorAttrs, [
            'font',
            'size',
            'link',
            'script',
            'list',
            'header',
            'align',
            'direction',
            'indent',
            'mentions',
            'mention',
            'width',
            'target',
            'rel',
            'code-block',
        ]);
        booleanAttrs.forEach(function (prop) {
            var v = dirtyAttrs[prop];
            if (v) {
                cleanAttrs[prop] = !!v;
            }
        });
        colorAttrs.forEach(function (prop) {
            var val = dirtyAttrs[prop];
            if (val &&
                (OpAttributeSanitizer.IsValidHexColor(val + '') ||
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
            cleanAttrs.link = OpLinkSanitizer_1.OpLinkSanitizer.sanitize(link + '', sanitizeOptions);
        }
        if (target && OpAttributeSanitizer.isValidTarget(target)) {
            cleanAttrs.target = target;
        }
        if (rel && OpAttributeSanitizer.IsValidRel(rel)) {
            cleanAttrs.rel = rel;
        }
        if (codeBlock) {
            if (OpAttributeSanitizer.IsValidLang(codeBlock)) {
                cleanAttrs['code-block'] = codeBlock;
            }
            else {
                cleanAttrs['code-block'] = !!codeBlock;
            }
        }
        if (script === value_types_1.ScriptType.Sub || value_types_1.ScriptType.Super === script) {
            cleanAttrs.script = script;
        }
        if (list === value_types_1.ListType.Bullet ||
            list === value_types_1.ListType.Ordered ||
            list === value_types_1.ListType.Checked ||
            list === value_types_1.ListType.Unchecked) {
            cleanAttrs.list = list;
        }
        if (Number(header)) {
            cleanAttrs.header = Math.min(Number(header), 6);
        }
        if (array_1.find([value_types_1.AlignType.Center, value_types_1.AlignType.Right, value_types_1.AlignType.Justify, value_types_1.AlignType.Left], function (a) { return a === align; })) {
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
            return cleaned;
        }, cleanAttrs);
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
    OpAttributeSanitizer.IsValidRel = function (relStr) {
        return !!relStr.match(/^[a-zA-Z\s\-]{1,250}$/i);
    };
    OpAttributeSanitizer.IsValidLang = function (lang) {
        if (typeof lang === 'boolean') {
            return true;
        }
        return !!lang.match(/^[a-zA-Z\s\-\\\/\+]{1,50}$/i);
    };
    return OpAttributeSanitizer;
}());
exports.OpAttributeSanitizer = OpAttributeSanitizer;
