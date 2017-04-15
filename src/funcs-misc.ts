
import {NewLine} from './value-types';

function flattenArray<T>(arr: T[][] | T[]): T[] {
    return [].concat.apply([], arr);
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
function tokenizeWithNewLines(str: any, newLine = "\n") {
    if (typeof str !== 'string' || str === newLine) {
        return [str];
    }

    var lines = str.split(newLine);
    
    if (lines.length === 1) {
        return lines;
    }

    var lastIndex = lines.length - 1;

    return lines.reduce((pv: string[], line: string, ind: number) => {

        if (ind !== lastIndex) {
            if (line !== "") {
                pv = pv.concat(line, newLine);
            } else {
                pv.push(newLine);
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

export {
    flattenArray,
    tokenizeWithNewLines,
    scrubUrl,
    preferSecond
};