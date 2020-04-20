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
        attrsStr = arrAttrs
            .map(function (attr) {
            return attr.key + (attr.value ? '="' + attr.value + '"' : '');
        })
            .join(' ');
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
    return (tag && "</" + tag + ">") || '';
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
        ["'", '&#x27;'],
        ['\\/', '&#x2F;'],
        ['\\(', '&#40;'],
        ['\\)', '&#41;'],
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
