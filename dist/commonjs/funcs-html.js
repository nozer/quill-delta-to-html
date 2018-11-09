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
function decodeHtml(str, encodeMapExtensions) {
    return encodeMappings(EncodeTarget.Html, encodeMapExtensions).reduce(decodeMapping, str);
}
exports.decodeHtml = decodeHtml;
function encodeHtml(str, preventDoubleEncoding, encodeMapExtensions) {
    if (preventDoubleEncoding === void 0) { preventDoubleEncoding = true; }
    if (preventDoubleEncoding) {
        str = decodeHtml(str, encodeMapExtensions);
    }
    return encodeMappings(EncodeTarget.Html, encodeMapExtensions).reduce(encodeMapping, str);
}
exports.encodeHtml = encodeHtml;
function encodeLink(str, encodeMapExtensions) {
    var linkMaps = encodeMappings(EncodeTarget.Url, encodeMapExtensions);
    var decoded = linkMaps.reduce(decodeMapping, str);
    return linkMaps.reduce(encodeMapping, decoded);
}
exports.encodeLink = encodeLink;
function encodeMappings(mtype, encodeMapExtensions) {
    var maps = [
        {
            key: '&',
            url: true,
            html: true,
            encodeTo: '&amp;',
            encodeMatch: '&amp;',
            decodeTo: '&',
            decodeMatch: '&'
        },
        {
            key: '<',
            url: true,
            html: true,
            encodeTo: '&lt;',
            encodeMatch: '&lt;',
            decodeTo: '<',
            decodeMatch: '<'
        },
        {
            key: '>',
            url: true,
            html: true,
            encodeTo: '&gt;',
            encodeMatch: '&gt;',
            decodeTo: '>',
            decodeMatch: '>'
        },
        {
            key: '"',
            url: true,
            html: true,
            encodeTo: '&quot;',
            encodeMatch: '&quot;',
            decodeTo: '"',
            decodeMatch: '"'
        },
        {
            key: "'",
            url: true,
            html: true,
            encodeTo: '&#x27;',
            encodeMatch: '&#x27;',
            decodeTo: "'",
            decodeMatch: "'"
        },
        {
            key: '/',
            url: false,
            html: true,
            encodeTo: '&#x2F;',
            encodeMatch: '&#x2F;',
            decodeTo: '/',
            decodeMatch: '/'
        },
        {
            key: '(',
            url: true,
            html: false,
            encodeTo: '&#40;',
            encodeMatch: '&#40;',
            decodeTo: '(',
            decodeMatch: '\\('
        },
        {
            key: ')',
            url: true,
            html: false,
            encodeTo: '&#41;',
            encodeMatch: '&#41;',
            decodeTo: ')',
            decodeMatch: '\\)'
        }
    ];
    if (encodeMapExtensions) {
        var replacementValues_1 = encodeMapExtensions.filter(function (_a) {
            var key = _a.key;
            return !!maps.find(function (_a) {
                var mapKey = _a.key;
                return mapKey === key;
            });
        });
        var extensionValues = encodeMapExtensions.filter(function (_a) {
            var key = _a.key;
            return !maps.find(function (_a) {
                var mapKey = _a.key;
                return mapKey === key;
            });
        });
        maps = maps.map(function (item) {
            var replacementValue = replacementValues_1.find(function (_a) {
                var replacementKey = _a.key;
                return replacementKey === item.key;
            });
            if (replacementValue) {
                return replacementValue;
            }
            return item;
        });
        maps = maps.concat(extensionValues);
    }
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
