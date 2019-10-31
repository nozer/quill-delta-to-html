import { DataType } from './value-types';

class InsertDataQuill {
  readonly type: DataType;
  readonly value: string;
  constructor(type: DataType, value: string) {
    this.type = type;
    this.value = value;
  }
}

class InsertDataCustom {
  readonly type: string;
  readonly value: any;
  constructor(type: string, value: any) {
    this.type = type;
    this.value = value;
  }
}

type InsertData = InsertDataCustom | InsertDataQuill;

export { InsertData, InsertDataCustom, InsertDataQuill };
