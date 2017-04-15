(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.commonConstants = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var NewLine = "\n";

    var GroupTypes = {
        DATA_CONTAINER_BLOCK: 'DATA_CONTAINER_BLOCK',
        DATA_BLOCK: 'DATA_BLOCK',
        INLINE: "INLINE"
    };

    var MutuallyExclusiveFormats = {
        blocks: ['list', 'header', 'blockquote', 'code-block'],
        embeds: ['video']
    };

    var QuillFormats = {
        inlines: ['background', 'bold', 'color', 'font', 'code', 'italic', 'link', 'size', 'strike', 'script', 'underline'],
        blocks: ['blockquote', 'header', 'indent', 'list', 'align', 'direction', 'code-block'],
        embeds: ['formula', 'image', 'video']
    };

    exports.NewLine = NewLine;
    exports.GroupTypes = GroupTypes;
    exports.MutuallyExclusiveFormats = MutuallyExclusiveFormats;
    exports.QuillFormats = QuillFormats;
});
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './common-constants'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./common-constants'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.commonConstants);
        global.commonFx = mod.exports;
    }
})(this, function (exports, _commonConstants) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.objectHasKey = exports.flattenArray = exports.convertNewlinedStringToArray = exports.isString = undefined;

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    var isString = function isString(stuff) {
        return typeof stuff === 'string';
    };

    var flattenArray = function flattenArray(arr) {
        return [].concat.apply([], arr);
    };

    var objectHasKey = function objectHasKey(obj, keys) {

        keys = [].concat(keys);

        if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object') {
            return false;
        }
        for (var i = 0; i < keys.length; i++) {
            var result = keys[i] in obj;
            if (result) {
                return true;
            }
        }
        return false;
    };

    var convertNewlinedStringToArray = function convertNewlinedStringToArray(str) {

        if (str === _commonConstants.NewLine || !isString(str)) {
            return [str];
        }

        var lines = str.split(_commonConstants.NewLine);

        if (lines.length === 1) {
            return lines;
        }

        var lastIndex = lines.length - 1;

        return lines.reduce(function (pv, cv, ind, arr) {

            if (ind !== lastIndex) {
                if (cv !== "") {
                    pv = pv.concat(cv, _commonConstants.NewLine);
                } else {
                    pv.push(_commonConstants.NewLine);
                }
            } else if (cv !== "") {
                pv.push(cv);
            }
            return pv;
        }, []);
    };

    exports.isString = isString;
    exports.convertNewlinedStringToArray = convertNewlinedStringToArray;
    exports.flattenArray = flattenArray;
    exports.objectHasKey = objectHasKey;
});
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports", "./common-fx", "./common-constants"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require("./common-fx"), require("./common-constants"));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.commonFx, global.commonConstants);
        global.denormalizeOp = mod.exports;
    }
})(this, function (exports, _commonFx, _commonConstants) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.denormalizeOp = undefined;


    var denormalizeOp = function denormalizeOp(op) {

        if (!(0, _commonFx.isString)(op.insert) || op.insert === _commonConstants.NewLine) {
            return [op];
        }

        var newlinedArray = (0, _commonFx.convertNewlinedStringToArray)(op.insert);

        if (newlinedArray.length === 1) {
            return [op];
        }

        var nlObj = Object.assign({}, op, {
            insert: _commonConstants.NewLine
        });

        return newlinedArray.map(function (line) {
            if (line === _commonConstants.NewLine) {
                return nlObj;
            }
            return Object.assign({}, op, {
                insert: line
            });
        });
    };

    exports.denormalizeOp = denormalizeOp;
});
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports", "./common-fx", "./common-constants"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require("./common-fx"), require("./common-constants"));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.commonFx, global.commonConstants);
        global.groupOps = mod.exports;
    }
})(this, function (exports, _commonFx, _commonConstants) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.groupDenormalizedOps = exports.__test_exports__ = undefined;


    var isDataContainerBlock = function isDataContainerBlock(op) {
        if (!op || !op.attributes) {
            return false;
        }
        return (0, _commonFx.objectHasKey)(op.attributes, _commonConstants.MutuallyExclusiveFormats.blocks);
    };

    var isDataBlock = function isDataBlock(op) {
        return (0, _commonFx.objectHasKey)(op.insert, _commonConstants.MutuallyExclusiveFormats.embeds);
    };

    var isMutuallyExclusiveBlock = function isMutuallyExclusiveBlock(op) {
        return isDataBlock(op) || isDataContainerBlock(op);
    };

    var isNewLineOp = function isNewLineOp(op) {
        return !!(op && op.insert === _commonConstants.NewLine);
    };

    var getOpsUntilNewLineOrExclusiveBlock = function getOpsUntilNewLineOrExclusiveBlock(currentIndex, denormalizedOps) {
        var result = {
            ops: [],
            lastIndex: currentIndex
        };
        for (var i = currentIndex - 1; i >= 0; i--) {
            var op = denormalizedOps[i];
            if (isNewLineOp(op) || isMutuallyExclusiveBlock(op)) {
                break;
            }
            result.lastIndex = i;
            result.ops.push(op);
        }
        result.ops.reverse();
        return result;
    };

    function groupDenormalizedOps(denormalizedOps) {
        var lastInd = denormalizedOps.length - 1;
        var result = [];
        var inlines = [];

        var makeGroupElm = function makeGroupElm(groupType, blockOp, data) {
            return { groupType: groupType, blockOp: blockOp, data: data };
        };

        var commitAndResetInlines = function commitAndResetInlines(result) {
            if (inlines.length) {
                inlines.reverse();
                var elm = makeGroupElm(_commonConstants.GroupTypes.INLINE, null, inlines);
                result.push(elm);
                inlines = [];
            }
        };

        for (var i = lastInd; i >= 0; i--) {
            var op = denormalizedOps[i];

            if (isDataContainerBlock(op)) {
                commitAndResetInlines(result);
                var opsResult = getOpsUntilNewLineOrExclusiveBlock(i, denormalizedOps);
                i = opsResult.lastIndex;
                var elm = makeGroupElm(_commonConstants.GroupTypes.DATA_CONTAINER_BLOCK, op, opsResult.ops);
                result.push(elm);
            } else if (isDataBlock(op)) {
                commitAndResetInlines(result);
                var _elm = makeGroupElm(_commonConstants.GroupTypes.DATA_BLOCK, op, []);
                result.push(_elm);
            } else {
                inlines.push(op);
            }
            i === 0 && commitAndResetInlines(result);
        }
        result.reverse();
        return result;
    };

    var __test_exports__ = {
        isDataBlock: isDataBlock,
        isDataContainerBlock: isDataContainerBlock,
        isNewLineOp: isNewLineOp
    };

    exports.__test_exports__ = __test_exports__;
    exports.groupDenormalizedOps = groupDenormalizedOps;
});
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['./denormalize-op', './group-ops'], factory);
  } else if (typeof exports !== "undefined") {
    factory(require('./denormalize-op'), require('./group-ops'));
  } else {
    var mod = {
      exports: {}
    };
    factory(global.denormalizeOp, global.groupOps);
    global.quill = mod.exports;
  }
})(this, function (_denormalizeOp, _groupOps) {
  'use strict';

  var ops = [{ insert: '\nb\nhi' }, { insert: '\n' }, { insert: 'haha' }, { insert: 'hmm' }, { insert: '\n', attributes: { blockquote: true } }, { insert: 'my', attributes: { bold: true } }, { insert: 'name\n and age', attributes: { bold: true, italic: true } }, { insert: '\n' }, { insert: 'nihat\nyes\n it is \n' }];
  var log = function log(v) {
    console.log(v);
  };

  var normalized = ops.map(_denormalizeOp.denormalizeOp);
  var flattened = [].concat.apply([], normalized);
  var grouped = (0, _groupOps.groupDenormalizedDelta)(flattened);
  log(grouped);

  // bold, italic, link(val is url),
  // blockquote:true, list:ordered|numbered, indent:1+
  // video, image, val is address 
});
