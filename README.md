[![Build Status](https://travis-ci.org/nozer/quill-delta-to-html.svg?branch=master)](https://travis-ci.org/nozer/quill-delta-to-html) 
[![Coverage Status](https://coveralls.io/repos/github/nozer/quill-delta-to-html/badge.svg?branch=master)](https://coveralls.io/github/nozer/quill-delta-to-html?branch=master)


# Quill Delta to HTML Converter #
Converts [Quill's](https://quilljs.com) [Delta](https://quilljs.com/docs/delta/) format to HTML (insert ops only).

If you need to render Quill's delta as HTML on the server (such as for SEO purposes), this library should help you. 

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
|orderedListTag| 'ol' | Parent tag for ordered list elements |
|bulletListTag| 'ul' | Parent tag for bullet list elements|
|listItemTag| 'li' | Tag for list item, in case you just wanna use `div` etc|
|paragraphTag| 'p' | Tag to wrap inline html elements|
|encodeHtml| true | If true, `<, >, /, ', ", &` characters in content will be encoded.|
|classPrefix| 'ql' | A css class name to prefix class generating styles such as `size`, `font`, etc. |
|multiLineBlockquote| true | Instead of rendering multiple `blockquote` elements for quotes that are consecutive and have same styles, it renders them into only one|
|multiLineHeader| true | Same deal as `multiLineBlockquote` for headers|
|multiLineCodeblock| true | Same deal as `multiLineBlockquote` for code-blocks|

## Events ##

You can customize the rendering by subscribing to relevant events before calling the `convert()` method. 

There are `before` and `after` events. 

`Before` events are called with raw operation objects for you to generate and return your own html. If you return a `falsy` value, system will return its own generated html. 

`After` events are called with generated html for you to inspect and maybe make some changes.

If you subscribe to any `before` event and return `non-falsy` value, corresponding `after` event won't be called. 

```javascript

// op refers to the block operation that is wrapping around child operations
// for video, childOpsArray will be null
converter.beforeBlockRender(function(op, childOpsArray){
    // ... generate your own html 
    // return your html
});
converter.afterBlockRender(function(htmlForThisGroup){
    // modify if you wish
    // return the html
});

// opsArray refers to a group of inline operations that are not video or not in a block. 
converter.beforeInlineGroupRender(function(opsArray){
    // ... generate your own html 
    // return your html
});
converter.afterInlineGroupRender(function(html){
    // modify if you wish
    // return the html
});

html = converter.convert();

```

Each `op` that is passed to the event callbacks will have following format: 

```javascript
{
    insert: {
        type: '' // one of 'text' | 'image' | 'video' | 'formula' 
        value: '...' // url for image/video, regular text for others 
    },
    attributes: {
        // quill delta attributes
    }
}
```

Your callbacks may be called multiple times. Imagine an entry where user...

    1 - first enters a header, 
    2 - then enters some inline content,
    3 - then enters a video
    4 - then enters quote 
    5 - then enters some more inline text. 

In this case, 

    1 - block event will be called with relevant block op and child ops
    2 - inlineGroup event will be called with ops in this section
    3 - block event will be called again 
    4 - block will be called once more
    5 - inlineGroup will be called again as well. 




