import { DeltaInsertOp } from './DeltaInsertOp';
import { InsertData } from './InsertData';
declare class InsertOpsConverter {
    static convert(deltaOps: any[]): DeltaInsertOp[];
    static convertInsertVal(insertPropVal: any): InsertData | null;
}
export { InsertOpsConverter };
