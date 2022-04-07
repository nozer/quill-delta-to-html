"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var url = __importStar(require("./helpers/url"));
var funcs_html_1 = require("./funcs-html");
var OpLinkSanitizer = (function () {
    function OpLinkSanitizer() {
    }
    OpLinkSanitizer.sanitize = function (link, options) {
        var sanitizerFn = function () {
            return undefined;
        };
        if (options && typeof options.urlSanitizer === 'function') {
            sanitizerFn = options.urlSanitizer;
        }
        var result = sanitizerFn(link);
        return typeof result === 'string' ? result : funcs_html_1.encodeLink(url.sanitize(link));
    };
    return OpLinkSanitizer;
}());
exports.OpLinkSanitizer = OpLinkSanitizer;
