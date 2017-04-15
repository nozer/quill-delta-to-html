"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var value_types_1 = require("./value-types");
var Embed_1 = require("./Embed");
var DeltaInsertOp = (function () {
    function DeltaInsertOp(insertVal, attributes) {
        this.insert = insertVal;
        this.attributes = attributes || {};
    }
    DeltaInsertOp.prototype.isContainerBlock = function () {
        var attrs = this.attributes;
        return !!(attrs.blockquote || attrs.list || attrs['code-block'] ||
            attrs.header || attrs.align || attrs.direction || attrs.indent);
    };
    DeltaInsertOp.prototype.isDataBlock = function () {
        if (!(this.insert instanceof Embed_1.Embed)) {
            return false;
        }
        return this.insert.type === Embed_1.EmbedType.Video;
    };
    DeltaInsertOp.prototype.isNewLine = function () {
        return typeof this.insert === 'string' && this.insert === value_types_1.NewLine;
    };
    DeltaInsertOp.prototype.isList = function () {
        return this.isOrderedList() || this.isBulletList();
    };
    DeltaInsertOp.prototype.isOrderedList = function () {
        return this.attributes.list === value_types_1.ListType.Ordered;
    };
    DeltaInsertOp.prototype.isBulletList = function () {
        return this.attributes.list === value_types_1.ListType.Bullet;
    };
    DeltaInsertOp.prototype.isSameListAs = function (op) {
        return this.attributes.list === op.attributes.list;
    };
    DeltaInsertOp.prototype.isEmbed = function () {
        return this.insert instanceof Embed_1.Embed;
    };
    DeltaInsertOp.prototype.isText = function () {
        return typeof this.insert === 'string';
    };
    DeltaInsertOp.prototype.isImage = function () {
        return this.isEmbed() && this.insert.type === Embed_1.EmbedType.Image;
    };
    DeltaInsertOp.prototype.isFormula = function () {
        return this.isEmbed() && this.insert.type === Embed_1.EmbedType.Formula;
    };
    DeltaInsertOp.prototype.isVideo = function () {
        return this.isEmbed() && this.insert.type === Embed_1.EmbedType.Video;
    };
    DeltaInsertOp.prototype.isLink = function () {
        return this.isText() && !!this.attributes.link;
    };
    return DeltaInsertOp;
}());
exports.DeltaInsertOp = DeltaInsertOp;
