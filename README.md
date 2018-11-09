[![Build Status](https://travis-ci.org/nozer/quill-delta-to-html.svg?branch=master)](https://travis-ci.org/nozer/quill-delta-to-html) 
[![Coverage Status](https://coveralls.io/repos/github/nozer/quill-delta-to-html/badge.svg?branch=master)](https://coveralls.io/github/nozer/quill-delta-to-html?branch=master)


# Quill Delta to HTML Converter #
Converts [Quill's](https://quilljs.com) [Delta](https://quilljs.com/docs/delta/) format to HTML (insert ops only) with properly nested lists.

You can try a live demo of the conversion by opening the `demo-browser.html` file after cloning the repo.

## Breaking change: `import/require` has changed as of `v0.10.0`. See Usage below ##



## Quickstart ## 

Installation
```
npm install quill-delta-to-html
```

Usage
```javascript(commonJS)
var QuillDeltaToHtmlConverter = require('quill-delta-to-html').QuillDeltaToHtmlConverter;

// TypeScript / ES6:
// import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html'; 

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
|`paragraphTag`| 'p' | Custom tag to wrap inline html elements|
|`encodeHtml`| true | If true, `<, >, /, ', ", &` characters in content will be encoded.|
|`classPrefix`| 'ql' | A css class name to prefix class generating styles such as `size`, `font`, etc. |
|`inlineStyles`| false | If true, use inline styles instead of classes |
|`multiLineBlockquote`| true | Instead of rendering multiple `blockquote` elements for quotes that are consecutive and have same styles(`align`, `indent`, and `direction`), it renders them into only one|
|`multiLineHeader`| true | Same deal as `multiLineBlockquote` for headers|
|`multiLineCodeblock`| true | Same deal as `multiLineBlockquote` for code-blocks|
|`multiLineParagraph`| true | Set to false to generate a new paragraph tag after each enter press (new line)|
|`linkRel`| '' | Specifies a value to put on the `rel` attr on links|
|`linkTarget`| '_blank' | Specifies target for all links; use `''` (empty string) to not generate `target` attribute. This can be overridden by an individual link op by specifying the `target` with a value in the respective op's attributes.|
|`allowBackgroundClasses`| false | If true, css classes will be added for background attr|
|`urlWhiteListExtensions`| undefined | Array of strings that if matched a url beginning with that string will ne be escaped
| `encodeMapExtensions` | undefined | Array of encode map extensions see Advanced Custom encoding docs below for more

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

## Rendering Inline Styles ##

If you are rendering to HTML that you intend to include in an email, using classes and a style sheet are not recommended, as [not all browsers support style sheets](https://www.campaignmonitor.com/css/style-element/style-in-head/).  quill-delta-to-html supports rendering inline styles instead.  The easiest way to enable this is to pass the option `inlineStyles: true`.

You can customize styles by passing an object to `inlineStyles` instead:

```js
inlineStyles: {
   font: {
      'serif': 'font-family: Georgia, Times New Roman, serif',
      'monospace': 'font-family: Monaco, Courier New, monospace'
   },
   size: {
      'small': 'font-size: 0.75em',
      'large': 'font-size: 1.5em',
      'huge': 'font-size: 2.5em'
   },
   indent: (value, op) => {
      var indentSize = parseInt(value, 10) * 3;
      var side = op.attributes['direction'] === 'rtl' ? 'right' : 'left';
      return 'padding-' + side + ':' + indentSize + 'em';
   },
   direction: (value, op) => {
      if (value === 'rtl') {
         return 'direction:rtl' + ( op.attributes['align'] ? '' : '; text-align: inherit' );
      } else {
         return '';
      }
   }
};
```

Keys to this object are the names of attributes from Quill.  The values are either a simple lookup table (like in the 'font' example above) used to map values to styles, or a `fn(value, op)` which returns a style string.

## Rendering Custom Blot Formats ##

You need to tell system how to render your custom blot by registering a renderer callback function to `renderCustomWith` method before calling the `convert()` method. 

If you would like your custom blot to be rendered as a block (not inside another block or grouped as part of inlines), then add `renderAsBlock: true` to its attributes. 

Example:
```javascript 
let ops = [
    {insert: {'my-blot': {id: 2, text: 'xyz'}}, attributes: {renderAsBlock: true|false}}
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

## Advanced Custom encoding ##
Supplying the option `encodeMapExtensions` as an array of `EncodeMapExtension` objects represented by the interface:
```ts
interface IEncodeMapExtension {
    key: string, 
    url: boolean, 
    html: boolean, 
    encodeTo: string, 
    encodeMatch: string, 
    decodeTo: string, 
    decodeMatch: string
}
```

| Option | Description 
|---|---|
| `key` | An indicator that will give this extension uniqueness any collisions will result in 'last in' being used|
| `url` | If true will be used in url encoding|
| `html` | If true will be used in html encoding|
| `encodeTo` | What to encode the `decodeTo` value to when a `decodeMatch` is hit|
| `encodeMatch` | Pattern of encoded value |
| `decodeTo` | What to decode the `encodedTo` value to when a `encodeMatch` is hit |
| `decodeMatch` | Pattern of decoded value |

### Example
Encodes `(` to `&#40;` for urls only
```ts
[{
    key: '(',
    url: true,
    html: false,
    encodeTo: '&#40;',
    encodeMatch: '&#40;',
    decodeTo: '(',
    decodeMatch: '\\('
}]
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
|`BlotBlock`|op: `op object`|

`BlotBlock` represents custom blots with `renderAsBlock:true` property pair in its attributes

See above for `op object` format. 
