"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var value_types_1 = require("./value-types");
var str = __importStar(require("./helpers/string"));
var obj = __importStar(require("./helpers/object"));
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
        var newlinedArray = str.tokenizeWithNewLines(op.insert + '');
        if (newlinedArray.length === 1) {
            return [op];
        }
        var nlObj = obj.assign({}, op, { insert: value_types_1.NewLine });
        return newlinedArray.map(function (line) {
            if (line === value_types_1.NewLine) {
                return nlObj;
            }
            return obj.assign({}, op, {
                insert: line,
            });
        });
    };
    return InsertOpDenormalizer;
}());
exports.InsertOpDenormalizer = InsertOpDenormalizer;
