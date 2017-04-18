
var QuillDeltaToHtmlConverter = require('./dist/commonjs/QuillDeltaToHtmlConverter').default;

var ops = [
    {insert: 'hello', attributes: {color: '#f00'}}
]; 

var converter = new QuillDeltaToHtmlConverter(ops);
var html = converter.convert();

console.log(html);