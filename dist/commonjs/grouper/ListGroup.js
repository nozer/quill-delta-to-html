"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ListGroup = (function () {
    function ListGroup(items) {
        this.items = items;
    }
    return ListGroup;
}());
exports.ListGroup = ListGroup;
var ListItem = (function () {
    function ListItem(item, innerList) {
        if (innerList === void 0) { innerList = null; }
        this.item = item;
        this.innerList = innerList;
    }
    return ListItem;
}());
exports.ListItem = ListItem;
