
import { DeltaInsertOp } from './DeltaInsertOp';
import { DataType } from './value-types';
import { InsertData, InsertDataCustom, InsertDataQuill } from './InsertData';
import { OpAttributeSanitizer } from './OpAttributeSanitizer';
import { InsertOpDenormalizer } from './InsertOpDenormalizer';

/**
 * Converts raw delta insert ops to array of denormalized DeltaInsertOp objects
 */
class InsertOpsConverter {

    static convert(deltaOps: any[]): DeltaInsertOp[] {

        if (!Array.isArray(deltaOps)) {
            return [];
        }

        var denormalizedOps = [].concat.apply([],
            deltaOps.map(InsertOpDenormalizer.denormalize));
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

    static convertInsertVal(insertPropVal: any): InsertData | null {
        if (typeof insertPropVal === 'string') {
            return new InsertDataQuill(DataType.Text, insertPropVal);
        }

        if (!insertPropVal || typeof insertPropVal !== 'object') {
            return null;
        }

        let keys = Object.keys(insertPropVal);
        if (!keys.length) {
            return null;
        }

        return DataType.Image in insertPropVal ?
            new InsertDataQuill(DataType.Image, insertPropVal[DataType.Image])
            : DataType.Video in insertPropVal ?
                new InsertDataQuill(DataType.Video, insertPropVal[DataType.Video])
                : DataType.Formula in insertPropVal ?
                    new InsertDataQuill(DataType.Formula, insertPropVal[DataType.Formula])
                    // custom 
                    : new InsertDataCustom(keys[0], insertPropVal[keys[0]]);
    }
}

export { InsertOpsConverter }
