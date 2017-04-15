"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InsertOpDenormalizer_1 = require("./InsertOpDenormalizer");
var DeltaInsertOp_1 = require("./DeltaInsertOp");
var funcs_misc_1 = require("./funcs-misc");
var Embed_1 = require("./Embed");
var OpAttributeSanitizer_1 = require("./OpAttributeSanitizer");
var InsertOpsConverter = (function () {
    function InsertOpsConverter() {
    }
    InsertOpsConverter.convert = function (deltaOps) {
        if (!Array.isArray(deltaOps)) {
            return [];
        }
        var denormalizedOps = funcs_misc_1.flattenArray(deltaOps.map(InsertOpDenormalizer_1.InsertOpDenormalizer.denormalize));
        var results = [];
        var insertVal, attributes;
        for (var _i = 0, denormalizedOps_1 = denormalizedOps; _i < denormalizedOps_1.length; _i++) {
            var op = denormalizedOps_1[_i];
            if (!op.insert) {
                continue;
            }
            insertVal = InsertOpsConverter.convertInsertVal(op.insert);
            if (!insertVal) {
                continue;
            }
            attributes = OpAttributeSanitizer_1.OpAttributeSanitizer.sanitize(op.attributes);
            results.push(new DeltaInsertOp_1.DeltaInsertOp(insertVal, attributes));
        }
        return results;
    };
    InsertOpsConverter.convertInsertVal = function (insertPropVal) {
        if (typeof insertPropVal === 'string') {
            return insertPropVal;
        }
        if (!insertPropVal || typeof insertPropVal !== 'object') {
            return null;
        }
        return Embed_1.EmbedType.Image in insertPropVal ?
            new Embed_1.Embed(Embed_1.EmbedType.Image, insertPropVal[Embed_1.EmbedType.Image])
            : Embed_1.EmbedType.Video in insertPropVal ?
                new Embed_1.Embed(Embed_1.EmbedType.Video, insertPropVal[Embed_1.EmbedType.Video])
                : Embed_1.EmbedType.Formula in insertPropVal ?
                    new Embed_1.Embed(Embed_1.EmbedType.Formula, insertPropVal[Embed_1.EmbedType.Formula])
                    : null;
    };
    return InsertOpsConverter;
}());
exports.InsertOpsConverter = InsertOpsConverter;
