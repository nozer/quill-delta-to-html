"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    var groupedElementIndexes = [];
    var isConsecutive = function (index) {
        return groupedElementIndexes.length
            && (groupedElementIndexes[groupedElementIndexes.length - 1] + 1) === index;
    };
    for (var i = 0; i < arr.length; i++) {
        if (predicate(arr[i])) {
            if (!isConsecutive(i)) {
                groups.push([]);
            }
            var g = groups[groups.length - 1];
            g.push(arr[i]);
            groupedElementIndexes.push(i);
        }
        else {
            groups.push(arr[i]);
        }
    }
    return groups;
}
exports.groupConsecutiveElementsWhile = groupConsecutiveElementsWhile;
