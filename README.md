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

You may customize the rendering by passing a configuration object to `QuillDeltaToHtmlConverter`. Table below lists the configuration options with defaults.

|Option | Default | Description 
|---|---|---|
|orderedListTag| 'ol' | Parent tag for ordered list elements |
|bulletListTag| 'ul' | Parent tag for bullet list elements|
|paragraphTag| 'p' | Tag to wrap inline html elements|
|encodeHtml| true | If true, `<, >, /, ', ", &` characters in content will be encoded.|
|classPrefix| 'ql' | A css class name to prefix class generating styles such as `size`, `font`, etc. |

## Events ##

You can customize the rendering by subscribing to relevant events before calling the `convert()` method. 

There are `before` and `after` events. 

`Before` events are called with raw operation objects for you to generate and return your own html. If you return a `falsy` value, system will return its own generated html. 

`After` events are called with generated html for you to inspect and maybe make some changes.

If you subscribe to any `before` event and return `non-falsy` value, corresponding `after` event won't be called. 

```javascript

// containerOp refers to the block operation that is wrapping around child operations
converter.beforeContainerBlockRender(function(containerOp, childOpsArray){
    // ... generate your own html 
    // return your html
});
converter.afterContainerBlockRender(function(htmlForThisGroup){
    // modify if you wish
    // return the html
});


// dataBlockOp refers to an operation that has its own data and also block.
// For now, only video type is a "data block" operation
converter.beforeDataBlockRender(function(dataBlockOp){
    // ... generate your own html 
    // return your html
});
converter.afterDataBlockRender(function(html){
    // modify if you wish
    // return the html
});

// ops refers to a group of inline operations that are not in a block. 
//  Those that are in a block, are rendered in ...ContainerBlockRender events
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

    1 - containerBlock event will be called with relevant block op and child ops
    2 - inlineGroup will be called with ops in this section
    3 - dataBlock will be called
    4 - containerBlock will be called again
    5 - inlineGroup will be called again as well. 




