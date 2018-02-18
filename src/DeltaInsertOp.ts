
import { NewLine, ListType, DataType } from './value-types';
import { IOpAttributes } from "./OpAttributeSanitizer";
import { InsertData, InsertDataCustom, InsertDataQuill } from './InsertData';

class DeltaInsertOp {

   readonly insert: InsertData;
   readonly attributes: IOpAttributes;

   constructor(insertVal: InsertData | string, attributes?: IOpAttributes) {
      if (typeof insertVal === 'string') {
         insertVal = new InsertDataQuill(DataType.Text, insertVal + '');
      }
      this.insert = insertVal;
      this.attributes = attributes || {};
   }

   static createNewLineOp() {
      return new DeltaInsertOp(NewLine);
   }

   isContainerBlock() {
      var attrs = this.attributes;
      return !!(
         attrs.blockquote || attrs.list || attrs['code-block'] ||
         attrs.header || attrs.align || attrs.direction || attrs.indent);
   }

   isBlockquote(): boolean {
      return this.attributes.blockquote;
   }

   isHeader():boolean {
      return !!this.attributes.header;
   }

   isSameHeaderAs(op: DeltaInsertOp): boolean {
      return op.attributes.header === this.attributes.header && this.isHeader();
   }

   // adi: alignment direction indentation 
   hasSameAdiAs(op: DeltaInsertOp) {
      return this.attributes.align === op.attributes.align
         && this.attributes.direction === op.attributes.direction
         && this.attributes.indent === op.attributes.indent
   }

   hasSameIndentationAs(op: DeltaInsertOp) {
      return this.attributes.indent === op.attributes.indent;
   }

   hasHigherIndentThan(op: DeltaInsertOp) {
      return (Number(this.attributes.indent) || 0) > (Number(op.attributes.indent) || 0);
   }

   isInline() {
      return !(this.isContainerBlock() || this.isVideo());
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
      return this.attributes.list === op.attributes.list && !!op.attributes.list;
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

   isCustom() {
      return this.insert instanceof InsertDataCustom;
      // return !(this.isText() || 
      //    this.isVideo() || this.isImage() || this.isFormula()
      // )
   }

   isMentions() {
      return this.isText() && !!this.attributes.mentions;
   }

}

export { DeltaInsertOp }; 