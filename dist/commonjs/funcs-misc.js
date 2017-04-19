"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var value_types_1 = require("./value-types");
function flattenArray(arr) {
    if (!Array.isArray(arr)) {
        return arr;
    }
    return arr.reduce(function (pv, v) { return pv.concat(flattenArray(v)); }, []);
}
exports.flattenArray = flattenArray;
function preferSecond(arg) {
    if (!Array.isArray(arg) || arg.length === 0) {
        return null;
    }
    return arg.length >= 2 ? arg[1] : arg[0];
}
exports.preferSecond = preferSecond;
function tokenizeWithNewLines(str) {
    if (typeof str !== 'string' || str === value_types_1.NewLine) {
        return [str];
    }
    var lines = str.split(value_types_1.NewLine);
    if (lines.length === 1) {
        return lines;
    }
    var lastIndex = lines.length - 1;
    return lines.reduce(function (pv, line, ind) {
        if (ind !== lastIndex) {
            if (line !== "") {
                pv = pv.concat(line, value_types_1.NewLine);
            }
            else {
                pv.push(value_types_1.NewLine);
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
function assign(target, varArg1, varArg2) {
    'use strict';
    if (varArg2 === void 0) { varArg2 = null; }
    if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
    }
    var to = Object(target);
    for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];
        if (nextSource != null) {
            for (var nextKey in nextSource) {
                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                    to[nextKey] = nextSource[nextKey];
                }
            }
        }
    }
    return to;
}
exports.assign = assign;
;
function groupConsecutiveElementsWhile(arr, predicate) {
    var groups = [];
    var currElm;
    for (var i = 0; i < arr.length; i++) {
        currElm = arr[i];
        if (i > 0 && predicate(currElm, arr[i - 1])) {
            var g = groups[groups.length - 1];
            g.push(currElm);
        }
        else {
            groups.push([currElm]);
        }
    }
    return groups.map(function (g) { return g.length === 1 ? g[0] : g; });
}
exports.groupConsecutiveElementsWhile = groupConsecutiveElementsWhile;
