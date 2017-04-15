
import { OpToHtmlConverter } from "./../src/OpToHtmlConverter";
import { DeltaInsertOp } from './../src/DeltaInsertOp';
import { Embed, EmbedType } from './../src/Embed';
import { ListType, ScriptType, DirectionType, AlignType } from './../src/value-types';

let assert = require('assert');

describe('OpToHtmlConverter', function () {

    var op = new DeltaInsertOp("hello");
    describe('constructor()', function () {
        it('should instantiate just fine :)', function () {
            var conv = new OpToHtmlConverter(op);
            assert.equal(conv instanceof OpToHtmlConverter, true);
        });
    });

    describe('prefixClass()', function () {
        it('should prefix class if an empty string prefix is not given', () => {
            var c = new OpToHtmlConverter(op, { classPrefix: '' });
            var act = c.prefixClass('my-class');
            assert.equal(act, 'my-class');

            c = new OpToHtmlConverter(op, { classPrefix: 'xx' });
            act = c.prefixClass('my-class');
            assert.equal(act, 'xx-my-class');

            c = new OpToHtmlConverter(op);
            act = c.prefixClass('my-class');
            assert.equal(act, 'ql-my-class');
        });
    });

    describe('getCssStyles()', function () {
        it('should return styles', () => {

            var c = new OpToHtmlConverter(op);
            assert.deepEqual(c.getCssStyles(), []);

            var o = new DeltaInsertOp('f', { background: 'red' });
            c = new OpToHtmlConverter(o);
            assert.deepEqual(c.getCssStyles(), ['background-color:red']);

            o = new DeltaInsertOp('f', { background: 'red', color: 'blue' });
            c = new OpToHtmlConverter(o);
            assert.deepEqual(c.getCssStyles(), ['background-color:red', 'color:blue']);

        });
    });

    describe('getCssClasses()', function () {
        it('should return prefixed classes', () => {

            var c = new OpToHtmlConverter(op);
            assert.deepEqual(c.getCssClasses(), []);

            var attrs = {
                indent: 1, align: AlignType.Center, direction: DirectionType.Rtl,
                font: 'roman', size: 'small'
            }
            var o = new DeltaInsertOp('f', attrs);
            c = new OpToHtmlConverter(o);
            var classes = ['ql-indent-1', 'ql-align-center', 'ql-direction-rtl',
                'ql-font-roman', 'ql-size-small'];
            assert.deepEqual(c.getCssClasses(), classes);

            o = new DeltaInsertOp(new Embed("image",""), attrs);
            c = new OpToHtmlConverter(o);
            assert.deepEqual(c.getCssClasses(), classes.concat('ql-image'));

            o = new DeltaInsertOp(new Embed("video",""), attrs);
            c = new OpToHtmlConverter(o);
            assert.deepEqual(c.getCssClasses(), classes.concat('ql-video'));

            o = new DeltaInsertOp(new Embed("formula",""), attrs);
            c = new OpToHtmlConverter(o);
            assert.deepEqual(c.getCssClasses(), classes.concat('ql-formula'));

        });
    });

    describe('getTags()', function () {
        it('should return tags to render this op', () => {

            var c = new OpToHtmlConverter(op);
            assert.deepEqual(c.getTags(), []);

            var o = new DeltaInsertOp("", {code: true});
            c = new OpToHtmlConverter(o);
            assert.deepEqual(c.getTags(), ['code']);

            [ ['image', 'img'], ['video', 'iframe'], ['formula', 'span']]
            .forEach((item: EmbedType[]) => {
                o = new DeltaInsertOp(new Embed(item[0],""));
                c = new OpToHtmlConverter(o);
                assert.deepEqual(c.getTags(), [item[1]]);
            });
            
            [['blockquote', 'blockquote'], ['code-block', 'pre'], 
                ['list', 'li'], ['header', 'h2']]
            .forEach((item) => {
                o = new DeltaInsertOp("", {[item[0]]: true, header: 2});
                c = new OpToHtmlConverter(o);
                assert.deepEqual(c.getTags(), [item[1]]);
            });

            
            var attrs = { link: 'http', script: ScriptType.Sub, bold:true, italic:true, 
                strike: true, underline: true
            };
            o = new DeltaInsertOp("", attrs);
            c = new OpToHtmlConverter(o);
            assert.deepEqual(c.getTags(), ['a', 'sub', 'strong', 'em', 's', 'u']);

        });
    });

    describe('getTagAttributes()', function () {
        it('should return tag attributes', () => {
            var op = new DeltaInsertOp("hello");
            var c = new OpToHtmlConverter(op);
            assert.deepEqual(c.getTagAttributes(), []);

            var o = new DeltaInsertOp("", {code: true, color: 'red'});
            c = new OpToHtmlConverter(o);
            assert.deepEqual(c.getTagAttributes(), []);

            var o = new DeltaInsertOp(new Embed("image","-"), {color: 'red'});
            c = new OpToHtmlConverter(o);
            assert.deepEqual(c.getTagAttributes(), [
                {key: 'class', value:"ql-image"},
                {key: 'src', value:"-"}
            ]);

            var o = new DeltaInsertOp(new Embed('formula',"-"), { color: 'red'});
            c = new OpToHtmlConverter(o);
            assert.deepEqual(c.getTagAttributes(), [
                {key: 'class', value:"ql-formula" }
            ]);

            var o = new DeltaInsertOp(new Embed('video',"-"), { color: 'red'});
            c = new OpToHtmlConverter(o);
            assert.deepEqual(c.getTagAttributes(), [
                {key: 'class', value:"ql-video" },
                {key: 'frameborder', value:'0'},
                {key: 'allowfullscreen', value: 'true'},
                {key: 'src', 'value': '-'}
            ]);
            
            var o = new DeltaInsertOp("link", { color: 'red', link: 'l'});
            c = new OpToHtmlConverter(o);
            console.log(c.getCssClasses(), c.getCssStyles(), '--');
            assert.deepEqual(c.getTagAttributes(), [
                {key: 'style', value:'color:red'},
                {key: 'href', value: 'l'}
            ]);

        });
    });

    describe('getContent()', function () {
        it('should return proper content depending on type', () => {
            var o = new DeltaInsertOp("aa", {indent: 1});
            var c = new OpToHtmlConverter(o);
            assert.equal(c.getContent(), '');

            o = new DeltaInsertOp('sss', {bold: true});
            c = new OpToHtmlConverter(o);
            assert.equal(c.getContent(), 'sss');

            o = new DeltaInsertOp(new Embed('formula', 'ff'), {bold: true});
            c = new OpToHtmlConverter(o);
            assert.equal(c.getContent(), 'ff');       

            o = new DeltaInsertOp(new Embed('video', 'ff'), {bold: true});
            c = new OpToHtmlConverter(o);
            assert.equal(c.getContent(), '');          
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
        var c1 = new OpToHtmlConverter(new DeltaInsertOp("aaa", attributes));
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

                var c = new OpToHtmlConverter(new DeltaInsertOp(""));
                var act = c.getHtmlParts();
                assert.equal(act.closing + act.content + act.opening, '');
                
                act = c1.getHtmlParts();
                assert.equal(act.opening + act.content + act.closing, result);
            });
        });

        describe('getHtmlParts()', function () {
            it('should return inline html', () => {

                var act = c1.getHtml();
                assert.equal(act, result);
            });
        });
    });

});
