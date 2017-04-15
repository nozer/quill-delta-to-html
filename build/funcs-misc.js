"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function flattenArray(arr) {
    return [].concat.apply([], arr);
}
exports.flattenArray = flattenArray;
function preferSecond(arg) {
    if (!Array.isArray(arg) || arg.length === 0) {
        return null;
    }
    return arg.length >= 2 ? arg[1] : arg[0];
}
exports.preferSecond = preferSecond;
function tokenizeWithNewLines(str, newLine) {
    if (newLine === void 0) { newLine = "\n"; }
    if (typeof str !== 'string' || str === newLine) {
        return [str];
    }
    var lines = str.split(newLine);
    if (lines.length === 1) {
        return lines;
    }
    var lastIndex = lines.length - 1;
    return lines.reduce(function (pv, line, ind) {
        if (ind !== lastIndex) {
            if (line !== "") {
                pv = pv.concat(line, newLine);
            }
            else {
                pv.push(newLine);
            }
        }
        else if (line !== "") {
            pv.push(line);
        }
        return pv;
    }, []);
}
exports.tokenizeWithNewLines = tokenizeWithNewLines;
function scrubUrl(url) {
    return url.replace(/[^-A-Za-z0-9+&@#/%?=~_|!:,.;\(\)]/g, '');
}
exports.scrubUrl = scrubUrl;
