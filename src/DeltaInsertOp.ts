
import { NewLine, ListType } from './value-types';
import { IOpAttributes } from './IOpAttributes';
import { Embed, EmbedType } from './Embed';
import { TInsert } from './TInsert';
import { tokenizeWithNewLines } from './funcs-misc';

class DeltaInsertOp {

    readonly insert: TInsert;
    readonly attributes: IOpAttributes;

    constructor(insertVal: TInsert, attributes?: IOpAttributes) {
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
        if (!(this.insert instanceof Embed)) {
            return false;
        }

        return (<Embed>this.insert).type === EmbedType.Video;
    }

    isNewLine() {
        return typeof this.insert === 'string' && this.insert === NewLine;
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

    isEmbed() {
        return this.insert instanceof Embed;
    }

    isText() {
        return typeof this.insert === 'string';
    }

    isImage() {
        return this.isEmbed() && (<Embed>this.insert).type === EmbedType.Image;
    }
    
    isFormula() {
        return this.isEmbed() && (<Embed>this.insert).type === EmbedType.Formula;
    }

    isVideo() {
        return this.isEmbed() && (<Embed>this.insert).type === EmbedType.Video;
    }

    isLink() {
        return this.isText() && !!this.attributes.link;
    }
    
}

export { DeltaInsertOp }; 