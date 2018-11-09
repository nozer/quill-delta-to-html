"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var url = require("./../helpers/url");
var MentionSanitizer = (function () {
    function MentionSanitizer() {
    }
    MentionSanitizer.sanitize = function (dirtyObj, urlWhiteListExtensions) {
        var cleanObj = {};
        if (!dirtyObj || typeof dirtyObj !== 'object') {
            return cleanObj;
        }
        if (dirtyObj.class && MentionSanitizer.IsValidClass(dirtyObj.class)) {
            cleanObj.class = dirtyObj.class;
        }
        if (dirtyObj.id && MentionSanitizer.IsValidId(dirtyObj.id)) {
            cleanObj.id = dirtyObj.id;
        }
        if (MentionSanitizer.IsValidTarget(dirtyObj.target + '')) {
            cleanObj.target = dirtyObj.target;
        }
        if (dirtyObj.avatar) {
            cleanObj.avatar = url.sanitize(dirtyObj.avatar + '', urlWhiteListExtensions);
        }
        if (dirtyObj['end-point']) {
            cleanObj['end-point'] = url.sanitize(dirtyObj['end-point'] + '', urlWhiteListExtensions);
        }
        if (dirtyObj.slug) {
            cleanObj.slug = (dirtyObj.slug + '');
        }
        return cleanObj;
    };
    MentionSanitizer.IsValidClass = function (classAttr) {
        return !!classAttr.match(/^[a-zA-Z0-9_\-]{1,500}$/i);
    };
    MentionSanitizer.IsValidId = function (idAttr) {
        return !!idAttr.match(/^[a-zA-Z0-9_\-\:\.]{1,500}$/i);
    };
    MentionSanitizer.IsValidTarget = function (target) {
        return ['_self', '_blank', '_parent', '_top'].indexOf(target) > -1;
    };
    return MentionSanitizer;
}());
exports.MentionSanitizer = MentionSanitizer;
