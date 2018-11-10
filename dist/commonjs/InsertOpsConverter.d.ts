import { DeltaInsertOp } from './DeltaInsertOp';
import { InsertData } from './InsertData';
import { IOpAttributeSanitizerOptions } from './OpAttributeSanitizer';
declare class InsertOpsConverter {
    static convert(deltaOps: null | any[], options: IOpAttributeSanitizerOptions): DeltaInsertOp[];
    static convertInsertVal(insertPropVal: any, sanitizeOptions: IOpAttributeSanitizerOptions): InsertData | null;
}
export { InsertOpsConverter };
