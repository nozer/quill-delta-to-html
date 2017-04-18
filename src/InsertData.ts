
import {DataType} from './value-types';

class InsertData {
    readonly type: DataType;
    readonly value: string;
    constructor(type: DataType, value: string) {
        this.type = type;
        this.value = value + '';
    }
};

export { InsertData };
