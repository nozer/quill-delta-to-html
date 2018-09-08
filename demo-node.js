var QuillDeltaToHtmlConverter = require("./dist/commonjs/main").QuillDeltaToHtmlConverter;

var ops = [{
      insert: 'hello',
      attributes: {
         color: '#f00'
      }
   },
   {
      "insert": {
         "customImageBlot": {
            "height": 150,
            "width": 150,
            "url": "https://d35bklnb0uzdnn.cloudfront.net/image/i@Hy81U57G7.png"
         }
      },
      attributes: {
         renderAsBlock: true
      }
   },
   {
      insert: 'how r u?'
   }
];

var converter = new QuillDeltaToHtmlConverter(ops);

converter.renderCustomWith((op, ctxop) => {
   return 'aa';
})
var html = converter.convert();

console.log(html);