
import { NewLine } from './value-types';

function flattenArray(arr: any): any {
   if (!Array.isArray(arr)) {
       return arr;
   }
   
   return arr.reduce((pv, v) => pv.concat(flattenArray(v)) , []);
}

function preferSecond(arg: any[]) {
    if (!Array.isArray(arg) || arg.length === 0) {
        return null;
    }
    return arg.length >= 2 ? arg[1] : arg[0];
}

/**
 *  Splits by new line character ("\n") by putting new line characters into the 
 *  array as well. Ex: "hello\n\nworld\n " => ["hello", "\n", "\n", "world", "\n", " "]
 */
function tokenizeWithNewLines(str: any) {
    if (typeof str !== 'string' || str === NewLine) {
        return [str];
    }

    var lines = str.split(NewLine);

    if (lines.length === 1) {
        return lines;
    }

    var lastIndex = lines.length - 1;

    return lines.reduce((pv: string[], line: string, ind: number) => {

        if (ind !== lastIndex) {
            if (line !== "") {
                pv = pv.concat(line, NewLine);
            } else {
                pv.push(NewLine);
            }
        } else if (line !== "") {
            pv.push(line);
        }
        return pv;
    }, []);
}

function scrubUrl(url: string) {
    return url.replace(/[^-A-Za-z0-9+&@#/%?=~_|!:,.;\(\)]/g, '');
}

// Copied from mdn's Object.assign 
function assign(target: any, varArg1: any, varArg2: any = null /* ... */) {
    'use strict';
    if (target == null) { // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object');
    }

    var to = Object(target);

    for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) { // Skip over if undefined or null
            for (var nextKey in nextSource) {
                // Avoid bugs when hasOwnProperty is shadowed
                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                    to[nextKey] = nextSource[nextKey];
                }
            }
        }
    }
    return to;
};

// Returns a new array by putting consecutive elements satisfying predicate into a new 
// array and returning others as they are. 
// Ex: [1, "ha", 3, "ha", "ha"] => [1, ["ha"], 3, ["ha", "ha"]] 
//      where predicate: (v) => typeof v === 'string'
function groupConsecutiveElementsWhile(arr: any[], predicate:(elm: any) => boolean): any[] {
    var groups = [];
    var groupedElementIndexes: any[] = [];
    var isConsecutive = (index: number) => {
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

        } else {
            groups.push(arr[i]);
        }
    }
    return groups;
}

export {
    tokenizeWithNewLines,
    scrubUrl,
    preferSecond,
    assign,
    groupConsecutiveElementsWhile,
    flattenArray
};