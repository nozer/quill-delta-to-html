
import { OpToHtmlConverter } from "./../src/OpToHtmlConverter";
import { DeltaInsertOp } from './../src/DeltaInsertOp';
import { InsertData } from './../src/InsertData'; 
import { ListType, ScriptType, DirectionType, AlignType, DataType } 
from './../src/value-types';

let assert = require('assert');

describe('OpToHtmlConverter', function () {

    
    describe('constructor()', function () {
        var op = new DeltaInsertOp("hello");
        it('should instantiate just fine :)', function () {
            var conv = new OpToHtmlConverter(op);
            assert.equal(conv instanceof OpToHtmlConverter, true);
        });
    });

    describe('prefixClass()', function () {
        
        it('should prefix class if an empty string prefix is not given', () => {
            var c = new OpToHtmlConverter({ classPrefix: '' });
            var act = c.prefixClass('my-class');
            assert.equal(act, 'my-class');

            c = new OpToHtmlConverter({ classPrefix: 'xx' });
            act = c.prefixClass('my-class');
            assert.equal(act, 'xx-my-class');

            c = new OpToHtmlConverter();
            act = c.prefixClass('my-class');
            assert.equal(act, 'ql-my-class');
        });
    });

    describe('getCssStyles()', function () {
        var op = new DeltaInsertOp("hello");
        it('should return styles', () => {

            var c = new OpToHtmlConverter();
            assert.deepEqual(c.getCssStyles(op), []);

            var o = new DeltaInsertOp('f', { background: 'red' });
            c = new OpToHtmlConverter();
            assert.deepEqual(c.getCssStyles(o), ['background-color:red']);

            o = new DeltaInsertOp('f', { background: 'red', color: 'blue' });
            c = new OpToHtmlConverter();
            assert.deepEqual(c.getCssStyles(o), ['background-color:red', 'color:blue']);

        });
    });

    describe('getCssClasses()', function () {
        it('should return prefixed classes', () => {
            var op = new DeltaInsertOp("hello");
            var c = new OpToHtmlConverter();
            assert.deepEqual(c.getCssClasses(op), []);

            var attrs = {
                indent: 1, align: AlignType.Center, direction: DirectionType.Rtl,
                font: 'roman', size: 'small'
            }
            var o = new DeltaInsertOp('f', attrs);
            c = new OpToHtmlConverter();
            var classes = ['ql-indent-1', 'ql-align-center', 'ql-direction-rtl',
                'ql-font-roman', 'ql-size-small'];
            assert.deepEqual(c.getCssClasses(o), classes);

            o = new DeltaInsertOp(new InsertData("image",""), attrs);
            c = new OpToHtmlConverter();
            assert.deepEqual(c.getCssClasses(o), classes.concat('ql-image'));

            o = new DeltaInsertOp(new InsertData("video",""), attrs);
            c = new OpToHtmlConverter();
            assert.deepEqual(c.getCssClasses(o), classes.concat('ql-video'));

            o = new DeltaInsertOp(new InsertData("formula",""), attrs);
            c = new OpToHtmlConverter();
            assert.deepEqual(c.getCssClasses(o), classes.concat('ql-formula'));

        });
    });

    describe('getTags()', function () {
        it('should return tags to render this op', () => {
            var op = new DeltaInsertOp("hello");
            var c = new OpToHtmlConverter();
            assert.deepEqual(c.getTags(op), []);

            var o = new DeltaInsertOp("", {code: true});
            
            assert.deepEqual(c.getTags(o), ['code']);

            [ ['image', 'img'], ['video', 'iframe'], ['formula', 'span']]
            .forEach((item: DataType[]) => {
                o = new DeltaInsertOp(new InsertData(item[0],""));
                assert.deepEqual(c.getTags(o), [item[1]]);
            });
            
            [['blockquote', 'blockquote'], ['code-block', 'pre'], 
                ['list', 'li'], ['header', 'h2']]
            .forEach((item) => {
                o = new DeltaInsertOp("", {[item[0]]: true, header: 2});
                assert.deepEqual(c.getTags(o), [item[1]]);
            });

            
            var attrs = { link: 'http', script: ScriptType.Sub, bold:true, italic:true, 
                strike: true, underline: true
            };
            o = new DeltaInsertOp("", attrs);
            
            assert.deepEqual(c.getTags(o), ['a', 'sub', 'strong', 'em', 's', 'u']);

        });
    });

    describe('getTagAttributes()', function () {
        it('should return tag attributes', () => {
            var op = new DeltaInsertOp("hello");
            var c = new OpToHtmlConverter();
            assert.deepEqual(c.getTagAttributes(op), []);

            var o = new DeltaInsertOp("", {code: true, color: 'red'});
            
            assert.deepEqual(c.getTagAttributes(o), []);

            var o = new DeltaInsertOp(new InsertData("image","-"), {color: 'red'});
            
            assert.deepEqual(c.getTagAttributes(o), [
                {key: 'class', value:"ql-image"},
                {key: 'src', value:"-"}
            ]);

            var o = new DeltaInsertOp(new InsertData('formula',"-"), { color: 'red'});
            
            assert.deepEqual(c.getTagAttributes(o), [
                {key: 'class', value:"ql-formula" }
            ]);

            var o = new DeltaInsertOp(new InsertData('video',"-"), { color: 'red'});
            
            assert.deepEqual(c.getTagAttributes(o), [
                {key: 'class', value:"ql-video" },
                {key: 'frameborder', value:'0'},
                {key: 'allowfullscreen', value: 'true'},
                {key: 'src', 'value': '-'}
            ]);
            
            var o = new DeltaInsertOp("link", { color: 'red', link: 'l'});
            
            
            assert.deepEqual(c.getTagAttributes(o), [
                {key: 'style', value:'color:red'},
                {key: 'href', value: 'l'}
            ]);

        });
    });

    describe('getContent()', function () {
        it('should return proper content depending on type', () => {
            var o = new DeltaInsertOp("aa", {indent: 1});
            var c = new OpToHtmlConverter();
            assert.equal(c.getContent(o), '');

            o = new DeltaInsertOp('sss<&>,', {bold: true});
            
            assert.equal(c.getContent(o), 'sss&lt;&amp;&gt;,');

            o = new DeltaInsertOp(new InsertData('formula', 'ff'), {bold: true});
           
            assert.equal(c.getContent(o), 'ff');       

            o = new DeltaInsertOp(new InsertData('video', 'ff'), {bold: true});
            
            assert.equal(c.getContent(o), '');          
        });
    });
   
    describe('html retrieval', function(){

        var attributes = {
            link: 'http://',
            bold: true,
            italic: true,
            underline: true,
            strike: true,
            script: ScriptType.Super,
            font: 'verdana',
            size: 'small',
            color: 'red',
            background: '#fff'
        };
        var op1 = new DeltaInsertOp("aaa", attributes);
        var c1 = new OpToHtmlConverter();
        var result  = [
            '<a class="ql-font-verdana ql-size-small"',
            ' style="background-color:#fff;color:red" href="http://">',
            '<sup>',
            '<strong><em><s><u>aaa</u></s></em></strong>',
            '</sup>',
            '</a>'
        ].join('');

        describe('getHtmlParts()', function () {
            it('should return inline html', () => {
                var op = new DeltaInsertOp("");
                
                var act = c1.getHtmlParts(op);
                assert.equal(act.closingTag + act.content + act.openingTag, '');
                
                act = c1.getHtmlParts(op1);
                assert.equal(act.openingTag + act.content + act.closingTag, result);
            });
        });

        describe('getHtml()', function () {
            it('should return inline html', () => {
                var act = c1.getHtml(op1);
                assert.equal(act, result);

                var op = new DeltaInsertOp("\n", {bold: true});
                assert.equal(c1.getHtml(op), '<strong>\n</strong>');

                var op = new DeltaInsertOp("\n", {color: '#fff'});
                assert.equal(c1.getHtml(op), '<span style="color:#fff">\n</span>');
            });
        });
        
    });

});
