"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var value_types_1 = require("./value-types");
require("./extensions/String");
require("./extensions/Object");
var InsertOpDenormalizer = (function () {
    function InsertOpDenormalizer() {
    }
    InsertOpDenormalizer.denormalize = function (op) {
        if (!op || typeof op !== 'object') {
            return [];
        }
        if (typeof op.insert === 'object' || op.insert === value_types_1.NewLine) {
            return [op];
        }
        var newlinedArray = (op.insert + '')._tokenizeWithNewLines();
        if (newlinedArray.length === 1) {
            return [op];
        }
        var nlObj = Object._assign({}, op, { insert: value_types_1.NewLine });
        return newlinedArray.map(function (line) {
            if (line === value_types_1.NewLine) {
                return nlObj;
            }
            return Object._assign({}, op, {
                insert: line
            });
        });
    };
    return InsertOpDenormalizer;
}());
exports.InsertOpDenormalizer = InsertOpDenormalizer;
