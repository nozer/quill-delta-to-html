
import { NewLine, ListType, DataType } from './value-types';
import { IOpAttributes } from './IOpAttributes';
import { InsertData } from './InsertData';
import { tokenizeWithNewLines } from './funcs-misc';

class DeltaInsertOp {

    readonly insert: InsertData;
    readonly attributes: IOpAttributes;

    constructor(insertVal: InsertData | string, attributes?: IOpAttributes) {
        if (!(insertVal instanceof InsertData)) {
            insertVal = new InsertData(DataType.Text, insertVal + '');
        }
        this.insert = insertVal;
        this.attributes = attributes || {};
    }

    isContainerBlock() {
        var attrs = this.attributes;
        return !!(
            attrs.blockquote || attrs.list || attrs['code-block'] || 
            attrs.header || attrs.align || attrs.direction || attrs.indent);
    }

    isDataBlock() {
        return this.isVideo();
    }

    isInline() {
        return !(this.isContainerBlock() || this.isDataBlock());
    }

    isCodeBlock() {
        return !!this.attributes['code-block'];
    }

    isJustNewline() {
        return this.insert.value === NewLine;
    }

    isList() {
        return this.isOrderedList() || this.isBulletList();
    }

    isOrderedList() {
        return this.attributes.list === ListType.Ordered;
    }

    isBulletList() {
        return this.attributes.list === ListType.Bullet;
    }

    isSameListAs(op: DeltaInsertOp): boolean {
        return this.attributes.list === op.attributes.list;
    }

    isText() {
        return this.insert.type === DataType.Text;
    }

    isImage() {
        return this.insert.type === DataType.Image;
    }
    
    isFormula() {
        return this.insert.type === DataType.Formula;
    }

    isVideo() {
        return this.insert.type === DataType.Video;
    }

    isLink() {
        return this.isText() && !!this.attributes.link;
    }
    
}

export { DeltaInsertOp }; 