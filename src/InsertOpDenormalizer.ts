
import { NewLine } from './value-types';
import { tokenizeWithNewLines } from './funcs-misc';

/**
 * Denormalization is splitting a text insert operation that has new lines into multiple 
 * ops where each op is either a new line or a text containing no new lines. 
 * 
 * Why? It makes things easier when picking op that needs to be inside a block when 
 * rendering to html
 * 
 * Example: 
 *  {insert: 'hello\n\nhow are you?\n', attributes: {bold: true}}
 * 
 * Denormalized:
 *  [
 *      {insert: 'hello', attributes: {bold: true}},
 *      {insert: '\n'},
 *      {insert: '\n'},
 *      {insert: 'how are you?', attributes: {bold: true}},
 *      {insert: '\n'}
 *  ]
 */

class InsertOpDenormalizer {

    static denormalize(op: any): any[] {
        if (!op || typeof op !== 'object') {
            return [];
        }

        if (typeof op.insert === 'object' || op.insert === NewLine) {
            return [op];
        }

        let newlinedArray = tokenizeWithNewLines(op.insert + '');

        if (newlinedArray.length === 1) {
            return [op];
        }

        let nlObj = { insert: NewLine };

        return newlinedArray.map((line: string) => {
            if (line === NewLine) {
                return nlObj;
            }
            return Object.assign({}, op, {
                insert: line
            });
        });
    }
}

export { InsertOpDenormalizer }