String.prototype._tokenizeWithNewLines = function () {
    var NewLine = "\n";
    var this_ = this.toString();
    if (this_ === NewLine) {
        return [this_];
    }
    var lines = this.split(NewLine);
    if (lines.length === 1) {
        return lines;
    }
    var lastIndex = lines.length - 1;
    return lines.reduce(function (pv, line, ind) {
        if (ind !== lastIndex) {
            if (line !== "") {
                pv = pv.concat(line, NewLine);
            }
            else {
                pv.push(NewLine);
            }
        }
        else if (line !== "") {
            pv.push(line);
        }
        return pv;
    }, []);
};
String.prototype._scrubUrl = function () {
    return this.replace(/[^-A-Za-z0-9+&@#/%?=~_|!:,.;\(\)]/g, '');
};
