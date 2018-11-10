"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sanitize(str) {
    var val = str;
    val = val.replace(/^\s*/gm, '');
    var whiteList = /^((https?|s?ftp|file|blob|mailto|tel):|#|\/|data:image\/)/;
    if (whiteList.test(val)) {
        return val;
    }
    return 'unsafe:' + val;
}
exports.sanitize = sanitize;
