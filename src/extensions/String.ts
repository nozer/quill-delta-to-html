
interface String {
    _tokenizeWithNewLines(): string[],
    _scrubUrl(): string
}


/**
 *  Splits by new line character ("\n") by putting new line characters into the 
 *  array as well. Ex: "hello\n\nworld\n " => ["hello", "\n", "\n", "world", "\n", " "]
 */

String.prototype._tokenizeWithNewLines = function() {

    const NewLine = "\n";
    var this_ = this.toString();

    if (this_ === NewLine) {
        return [this_];
    }

    var lines = this.split(NewLine);

    if (lines.length === 1) {
        return lines;
    }

    var lastIndex = lines.length - 1;

    return lines.reduce((pv: string[], line: string, ind: number) => {

        if (ind !== lastIndex) {
            if (line !== "") {
                pv = pv.concat(line, NewLine);
            } else {
                pv.push(NewLine);
            }
        } else if (line !== "") {
            pv.push(line);
        }
        return pv;
    }, []);
};

String.prototype._scrubUrl = function() {
    return this.replace(/[^-A-Za-z0-9+&@#/%?=~_|!:,.;\(\)]/g, '');
}