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
        {
            url: true,
            html: true,
            encodeTo: '&amp;',
            encodeMatch: '&amp;',
            decodeTo: '&',
            decodeMatch: '&'
        },
        {
            url: true,
            html: true,
            encodeTo: '&lt;$1',
            encodeMatch: '&lt;',
            decodeTo: '<',
            decodeMatch: '<([^%])'
        },
        {
            url: true,
            html: true,
            encodeTo: '$1&gt;',
            encodeMatch: '&gt;',
            decodeTo: '>',
            decodeMatch: '([^%])>'
        },
        {
            url: true,
            html: true,
            encodeTo: '&quot;',
            encodeMatch: '&quot;',
            decodeTo: '"',
            decodeMatch: '"'
        },
        {
            url: true,
            html: true,
            encodeTo: '&#x27;',
            encodeMatch: '&#x27;',
            decodeTo: "'",
            decodeMatch: "'"
        },
        {
            url: false,
            html: true,
            encodeTo: '&#x2F;',
            encodeMatch: '&#x2F;',
            decodeTo: '/',
            decodeMatch: '/'
        },
        {
            url: true,
            html: false,
            encodeTo: '&#40;',
            encodeMatch: '&#40;',
            decodeTo: '(',
            decodeMatch: '\\('
        },
        {
            url: true,
            html: false,
            encodeTo: '&#41;',
            encodeMatch: '&#41;',
            decodeTo: ')',
            decodeMatch: '\\)'
        }
    ];
    if (mtype === EncodeTarget.Html) {
        return maps.filter(function (_a) {
            var html = _a.html;
            return html;
        });
    }
    else {
        return maps.filter(function (_a) {
            var url = _a.url;
            return url;
        });
    }
}
function encodeMapping(str, mapping) {
    return str.replace(new RegExp(mapping.decodeMatch, 'g'), mapping.encodeTo);
}
function decodeMapping(str, mapping) {
    return str.replace(new RegExp(mapping.encodeMatch, 'g'), mapping.decodeTo);
}
