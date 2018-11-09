import { DeltaInsertOp } from './DeltaInsertOp';
import { InsertData } from './InsertData';
declare class InsertOpsConverter {
    static convert(deltaOps: null | any[], urlWhiteListExtensions?: string[]): DeltaInsertOp[];
    static convertInsertVal(insertPropVal: any): InsertData | null;
}
export { InsertOpsConverter };
