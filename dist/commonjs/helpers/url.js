"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sanitize(str, urlWhiteListExtensions) {
    var val = str;
    val = val.replace(/^\s*/gm, '');
    var whiteList = new RegExp("^s*((|https?|s?ftp|file|blob|mailto|tel):" + (urlWhiteListExtensions ? '|' + urlWhiteListExtensions.join('|') : '') + "|#|/|data:image/)");
    if (whiteList.test(val)) {
        return val;
    }
    return 'unsafe:' + val;
}
exports.sanitize = sanitize;
