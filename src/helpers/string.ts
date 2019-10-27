/**
 *  Splits by new line character ("\n") by putting new line characters into the
 *  array as well. Ex: "hello\n\nworld\n " => ["hello", "\n", "\n", "world", "\n", " "]
 */

function tokenizeWithNewLines(str: string): string[] {
  const NewLine = '\n';

  if (str === NewLine) {
    return [str];
  }

  var lines = str.split(NewLine);

  if (lines.length === 1) {
    return lines;
  }

  var lastIndex = lines.length - 1;

  return lines.reduce((pv: string[], line: string, ind: number) => {
    if (ind !== lastIndex) {
      if (line !== '') {
        pv = pv.concat(line, NewLine);
      } else {
        pv.push(NewLine);
      }
    } else if (line !== '') {
      pv.push(line);
    }
    return pv;
  }, []);
}

export { tokenizeWithNewLines };
