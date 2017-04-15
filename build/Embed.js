"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var funcs_misc_1 = require("./funcs-misc");
var EmbedType = {
    Image: "image",
    Video: "video",
    Formula: "formula"
};
exports.EmbedType = EmbedType;
var Embed = (function () {
    function Embed(type, value) {
        this.type = type;
        if (type === EmbedType.Image || type === EmbedType.Video) {
            value = funcs_misc_1.scrubUrl(value);
        }
        this.value = value;
    }
    return Embed;
}());
exports.Embed = Embed;
;
