import { DataType } from './value-types';
declare class InsertDataQuill {
    readonly type: DataType;
    readonly value: string;
    constructor(type: DataType, value: string);
}
declare class InsertDataCustom {
    readonly type: string;
    readonly value: any;
    constructor(type: string, value: any);
}
declare type InsertData = InsertDataCustom | InsertDataQuill;
export { InsertData, InsertDataCustom, InsertDataQuill };
