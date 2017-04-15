
import { InsertOpDenormalizer } from './InsertOpDenormalizer';
import { DeltaInsertOp } from './DeltaInsertOp';
import { flattenArray } from './funcs-misc';
import { Embed, EmbedType } from './Embed';
import { TInsert } from './TInsert';
import { OpAttributeSanitizer } from './OpAttributeSanitizer';

/**
 * Converts raw delta insert ops to array of denormalized DeltaInsertOp objects 
 */
class InsertOpsConverter {

    static convert(deltaOps: any[]): DeltaInsertOp[] {

        if (!Array.isArray(deltaOps)) {
            return [];
        }

        var denormalizedOps = flattenArray(deltaOps.map(InsertOpDenormalizer.denormalize));

        var results: DeltaInsertOp[] = [];

        var insertVal, attributes;

        for (var op of denormalizedOps) {
            if (!op.insert) {
                continue;
            }

            insertVal = InsertOpsConverter.convertInsertVal(op.insert);
            if (!insertVal) {
                continue;
            }

            attributes =  OpAttributeSanitizer.sanitize(op.attributes);
            
            results.push(new DeltaInsertOp(insertVal, attributes));
        }
        return results;
    }

    static convertInsertVal(insertPropVal: any): TInsert | null {
        if (typeof insertPropVal === 'string') {
            return insertPropVal;
        }

        if (!insertPropVal || typeof insertPropVal !== 'object') {
            return null;
        }

        return EmbedType.Image in insertPropVal ?
            new Embed(EmbedType.Image, insertPropVal[EmbedType.Image])
            : EmbedType.Video in insertPropVal ?
                new Embed(EmbedType.Video, insertPropVal[EmbedType.Video])
                : EmbedType.Formula in insertPropVal ?
                    new Embed(EmbedType.Formula, insertPropVal[EmbedType.Formula])
                    : null;
    }
}

export { InsertOpsConverter }