"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DeltaInsertOp_1 = require("./DeltaInsertOp");
var value_types_1 = require("./value-types");
var InsertData_1 = require("./InsertData");
var OpAttributeSanitizer_1 = require("./OpAttributeSanitizer");
var InsertOpDenormalizer_1 = require("./InsertOpDenormalizer");
var OpLinkSanitizer_1 = require("./OpLinkSanitizer");
var InsertOpsConverter = (function () {
    function InsertOpsConverter() {
    }
    InsertOpsConverter.convert = function (deltaOps, options) {
        if (!Array.isArray(deltaOps)) {
            return [];
        }
        var denormalizedOps = [].concat.apply([], deltaOps.map(InsertOpDenormalizer_1.InsertOpDenormalizer.denormalize));
        var results = [];
        var insertVal, attributes;
        for (var _i = 0, denormalizedOps_1 = denormalizedOps; _i < denormalizedOps_1.length; _i++) {
            var op = denormalizedOps_1[_i];
            if (!op.insert) {
                continue;
            }
            insertVal = InsertOpsConverter.convertInsertVal(op.insert, options);
            if (!insertVal) {
                continue;
            }
            attributes = OpAttributeSanitizer_1.OpAttributeSanitizer.sanitize(op.attributes, options);
            results.push(new DeltaInsertOp_1.DeltaInsertOp(insertVal, attributes));
        }
        return results;
    };
    InsertOpsConverter.convertInsertVal = function (insertPropVal, sanitizeOptions) {
        if (typeof insertPropVal === 'string') {
            return new InsertData_1.InsertDataQuill(value_types_1.DataType.Text, insertPropVal);
        }
        if (!insertPropVal || typeof insertPropVal !== 'object') {
            return null;
        }
        var keys = Object.keys(insertPropVal);
        if (!keys.length) {
            return null;
        }
        return value_types_1.DataType.Image in insertPropVal
            ? new InsertData_1.InsertDataQuill(value_types_1.DataType.Image, OpLinkSanitizer_1.OpLinkSanitizer.sanitize(insertPropVal[value_types_1.DataType.Image] + '', sanitizeOptions))
            : value_types_1.DataType.Video in insertPropVal
                ? new InsertData_1.InsertDataQuill(value_types_1.DataType.Video, OpLinkSanitizer_1.OpLinkSanitizer.sanitize(insertPropVal[value_types_1.DataType.Video] + '', sanitizeOptions))
                : value_types_1.DataType.Formula in insertPropVal
                    ? new InsertData_1.InsertDataQuill(value_types_1.DataType.Formula, insertPropVal[value_types_1.DataType.Formula])
                    :
                        new InsertData_1.InsertDataCustom(keys[0], insertPropVal[keys[0]]);
    };
    return InsertOpsConverter;
}());
exports.InsertOpsConverter = InsertOpsConverter;
