Array.prototype._preferSecond = function () {
    if (this.length === 0) {
        return null;
    }
    return this.length >= 2 ? this[1] : this[0];
};
Array.prototype._flatten = function () {
    return this.reduce(function (pv, v) {
        return pv.concat(Array.isArray(v) ? v._flatten() : v);
    }, []);
};
Array.prototype._groupConsecutiveElementsWhile = function (predicate) {
    var groups = [];
    var currElm, currGroup;
    for (var i = 0; i < this.length; i++) {
        currElm = this[i];
        if (i > 0 && predicate(currElm, this[i - 1])) {
            currGroup = groups[groups.length - 1];
            currGroup.push(currElm);
        }
        else {
            groups.push([currElm]);
        }
    }
    return groups.map(function (g) { return g.length === 1 ? g[0] : g; });
};
Array.prototype._sliceFromReverseWhile = function (startIndex, predicate) {
    var result = {
        elements: [],
        sliceStartsAt: -1
    };
    for (var i = startIndex; i >= 0; i--) {
        if (!predicate(this[i])) {
            break;
        }
        result.sliceStartsAt = i;
        result.elements.unshift(this[i]);
    }
    return result;
};
Array.prototype._intersperse = function (item) {
    var _this = this;
    return this.reduce(function (pv, v, index) {
        pv.push(v);
        if (index < (_this.length - 1)) {
            pv.push(item);
        }
        return pv;
    }, []);
};
