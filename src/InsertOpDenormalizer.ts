
import { NewLine } from './value-types';
import './extensions/String';
import './extensions/Object';


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
 *      {insert: '\n', attributes: {bold: true}},
 *      {insert: '\n', attributes: {bold: true}},
 *      {insert: 'how are you?', attributes: {bold: true}},
 *      {insert: '\n', attributes: {bold: true}}
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

        let newlinedArray = (op.insert + '')._tokenizeWithNewLines();

        if (newlinedArray.length === 1) {
            return [op];
        }

        let nlObj = Object._assign({}, op, { insert: NewLine });

        return newlinedArray.map((line: string) => {
            if (line === NewLine) {
                return nlObj;
            }
            return Object._assign({}, op, {
                insert: line
            });
        });
    }
}

export { InsertOpDenormalizer }