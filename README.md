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

// or, in TypeScript:
// import QuillDeltaToHtmlConverter = require('quill-delta-to-html'); 

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
|linkTarget| '_blank' | Specifies target for all links; use `''` (empty string) to not generate `target` attribute. This can be overridden by an individual link op by specifiying the `target` with a value in the respective op's attributes.|
|allowBackgroundClasses| false | If true, css classes will be added for background attr|

## Rendering Quill Formats ##

You can customize the rendering of Quill formats by registering to the render events before calling the `convert()` method. 

There are `beforeRender` and `afterRender` events and they are called multiple times before and after rendering each group. A group is one of:

- continuous sets of inline elements
- a video element
- list elements
- block elements (header, code-block, blockquote, align, indent, and direction) 

`beforeRender` event is called with raw operation objects for you to generate and return your own html. If you return a `falsy` value, system will return its own generated html. 

`afterRender` event is called with generated html for you to inspect, maybe make some changes and return your modified or original html.

```javascript

converter.beforeRender(function(groupType, data){
    // ... generate your own html 
    // return your html
});
converter.afterRender(function(groupType, htmlString){
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

## Rendering Custom Blot Formats ##

You need to tell system how to render your custom blot by registering a renderer callback function to `renderCustomWith` method before calling the `convert()` method. 

Example:
```javascript 
let ops = [
    {insert: {'my-blot': {id: 2, text: 'xyz'}}}
];

let converter = new QuillDeltaToHtmlConverter(ops);

// customOp is your custom blot op
// contextOp is the block op that wraps this op, if any. 
// If, for example, your custom blot is located inside a list item,
// then contextOp would provide that op. 
converter.renderCustomWith(function(customOp, contextOp){
    if (customOp.insert.type === 'my-blot') {
        let val = customOp.insert.value;
        return `<span id="${val.id}">${val.text}</span>`;
    } else {
        return 'Unmanaged custom blot!';
    }
});

html = converter.convert();
```
`customOp object` will have the following format: 

```javascript
{
    insert: {
        type: string //whatever you specified as key for insert, in above example: 'my-blot'
        value: any // value for the custom blot  
    }, 
    attributes: {
        // ... any attributes custom blot may have
    }
}
```

## Advanced Custom Rendering Using Grouped Ops ##

If you want to do the full rendering yourself, you can do so 
by getting the processed & grouped ops.

```javascript
let groupedOps = converter.getGroupedOps();
```
Each element in groupedOps array will be an instance of the 
following types: 

|type|properties|
|---|---|
|`InlineGroup`|ops: Array<`op object`>|
|`VideoItem`|op: `op object`|
|`BlockGroup`|op: `op object`, ops: Array<`op object`>|
|`ListGroup`|items: Array<`ListItem`>|
||ListItem: {item:`BlockGroup`, innerList:`ListGroup`}|

See above for `op object` format. 
