[![Build Status](https://travis-ci.org/nozer/quill-delta-to-html.svg?branch=master)](https://travis-ci.org/nozer/quill-delta-to-html) 
[![Coverage Status](https://coveralls.io/repos/github/nozer/quill-delta-to-html/badge.svg?branch=master)](https://coveralls.io/github/nozer/quill-delta-to-html?branch=master)


# Quill Delta to HTML Converter #
Converts [Quill's](https://quilljs.com) [Delta](https://quilljs.com/docs/delta/) format to HTML (insert ops only) with properly nested lists.

You can try a live demo of the conversion by opening the `demo-browser.html` file after cloning the repo.


## Quickstart ## 

Installation
```
npm install quill-delta-to-html
```

Usage
```javascript
var QuillDeltaToHtmlConverter = require('quill-delta-to-html');

var deltaOps =  [
    {insert: "Hello\n"},
    {insert: "This is colorful", attributes: {color: '#f00'}}
];

var cfg = {};

var converter = new QuillDeltaToHtmlConverter(deltaOps, cfg);

var html = converter.convert(); 
```

## Configuration ## 

`QuillDeltaToHtmlConverter` accepts a few configuration options as shown below:

|Option | Default | Description 
|---|---|---|
|paragraphTag| 'p' | Custom tag to wrap inline html elements|
|encodeHtml| true | If true, `<, >, /, ', ", &` characters in content will be encoded.|
|classPrefix| 'ql' | A css class name to prefix class generating styles such as `size`, `font`, etc. |
|multiLineBlockquote| true | Instead of rendering multiple `blockquote` elements for quotes that are consecutive and have same styles(`align`, `indent`, and `direction`), it renders them into only one|
|multiLineHeader| true | Same deal as `multiLineBlockquote` for headers|
|multiLineCodeblock| true | Same deal as `multiLineBlockquote` for code-blocks|
|linkRel| '' | Specifies a value to put on the `rel` attr on links|
|allowBackgroundClasses| false | If true, css classes will be added for background attr|

## Events ##

You can customize the rendering by subscribing to events before calling the `convert()` method. 

There are `beforeRender` and `afterRender` events and they are called multiple times before and after rendering each group. A group is one of:

- continuous sets of inline elements
- a video element
- list elements
- block elements (header, code-block, and blockquote) 

`beforeRender` event is called with raw operation objects for you to generate and return your own html. If you return a `falsy` value, system will return its own generated html. 

`afterRender` event is called with generated html for you to inspect, maybe make some changes and return your modified or original html.

```javascript

converter.beforeRender(function(groupType, data){
    // ... generate your own html 
    // return your html
});
converter.afterRender(function(htmlString){
    // modify if you wish
    // return the html
});

html = converter.convert();

```

Following shows the parameter formats for `beforeRender` event: 



|groupType|data|
|---|---|
|`video`|{op: `op object`}|
|`block`|{op: `op object`: ops: Array<`op object`>}|
|`list`| {items: Array<{item: `block`, innerList: `list` or `null` }> }|
|`inline-group`|{ops: Array<`op object`>}|

`op object` will have the following format: 

```javascript
{
    insert: {
        type: '' // one of 'text' | 'image' | 'video' | 'formula',
        value: '' // some string value  
    }, 
    attributes: {
        // ... quill delta attributes 
    }
}
```

