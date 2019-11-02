"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var group_types_1 = require("./group-types");
var array_1 = require("../helpers/array");
var TableGrouper = (function () {
    function TableGrouper() {
    }
    TableGrouper.prototype.group = function (groups) {
        var tableBlocked = this.convertTableBlocksToTableGroups(groups);
        return tableBlocked;
    };
    TableGrouper.prototype.convertTableBlocksToTableGroups = function (items) {
        var _this = this;
        var grouped = array_1.groupConsecutiveElementsWhile(items, function (g, gPrev) {
            return (g instanceof group_types_1.BlockGroup &&
                gPrev instanceof group_types_1.BlockGroup &&
                g.op.isTable() &&
                gPrev.op.isTable());
        });
        return grouped.map(function (item) {
            if (!Array.isArray(item)) {
                if (item instanceof group_types_1.BlockGroup && item.op.isTable()) {
                    return new group_types_1.TableGroup([new group_types_1.TableRow([new group_types_1.TableCell(item)])]);
                }
                return item;
            }
            return new group_types_1.TableGroup(_this.convertTableBlocksToTableRows(item));
        });
    };
    TableGrouper.prototype.convertTableBlocksToTableRows = function (items) {
        var grouped = array_1.groupConsecutiveElementsWhile(items, function (g, gPrev) {
            return (g instanceof group_types_1.BlockGroup &&
                gPrev instanceof group_types_1.BlockGroup &&
                g.op.isTable() &&
                gPrev.op.isTable() &&
                g.op.isSameTableRowAs(gPrev.op));
        });
        return grouped.map(function (item) {
            return new group_types_1.TableRow(Array.isArray(item)
                ? item.map(function (it) { return new group_types_1.TableCell(it); })
                : [new group_types_1.TableCell(item)]);
        });
    };
    return TableGrouper;
}());
exports.TableGrouper = TableGrouper;
