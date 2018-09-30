
import { OpToHtmlConverter } from "./../src/OpToHtmlConverter";
import { DeltaInsertOp } from './../src/DeltaInsertOp';
import { InsertDataQuill } from './../src/InsertData';
import { ScriptType, DirectionType, AlignType, DataType } from './../src/value-types';

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
           var op = new DeltaInsertOp("aa")
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
        var op = new DeltaInsertOp("hello");
        it('should return styles', () => {

            var c = new OpToHtmlConverter(op);
            assert.deepEqual(c.getCssStyles(), []);

            var o = new DeltaInsertOp('f', { background: 'red' });
            c = new OpToHtmlConverter(o);
            assert.deepEqual(c.getCssStyles(), ['background-color:red']);

            o = new DeltaInsertOp('f', { background: 'red', color: 'blue' });
            c = new OpToHtmlConverter(o);
            assert.deepEqual(c.getCssStyles(), ['color:blue', 'background-color:red']);

            c = new OpToHtmlConverter(o, { allowBackgroundClasses: true });
            assert.deepEqual(c.getCssStyles(), ['color:blue']);

        });

        it('should return inline styles', function () {
            var op = new DeltaInsertOp("hello");
            var c = new OpToHtmlConverter(op, { inlineStyles: {} });
            assert.deepEqual(c.getCssStyles(), []);

            var attrs = {
                indent: 1, align: AlignType.Center, direction: DirectionType.Rtl,
                font: 'roman', size: 'small', background: 'red'
            }
            var o = new DeltaInsertOp('f', attrs);
            c = new OpToHtmlConverter(o, { inlineStyles: {} });
            var styles = [
                'background-color:red',
                'padding-right:3em',
                'text-align:center',
                'direction:rtl',
                'font-family:roman',
                'font-size: 0.75em'
            ];
            assert.deepEqual(c.getCssStyles(), styles);

            o = new DeltaInsertOp(new InsertDataQuill(DataType.Image, ""), attrs);
            c = new OpToHtmlConverter(o, { inlineStyles: {} });
            assert.deepEqual(c.getCssStyles(), styles);

            o = new DeltaInsertOp(new InsertDataQuill(DataType.Video, ""), attrs);
            c = new OpToHtmlConverter(o, { inlineStyles: {} });
            assert.deepEqual(c.getCssStyles(), styles);

            o = new DeltaInsertOp(new InsertDataQuill(DataType.Formula, ""), attrs);
            c = new OpToHtmlConverter(o, { inlineStyles: {} });
            assert.deepEqual(c.getCssStyles(), styles);

            o = new DeltaInsertOp('f', attrs);
            c = new OpToHtmlConverter(o, { inlineStyles: {} });
            assert.deepEqual(c.getCssStyles(), styles);

            o = new DeltaInsertOp(new InsertDataQuill(DataType.Image, ""), {direction: DirectionType.Rtl});
            c = new OpToHtmlConverter(o, { inlineStyles: {} });
            assert.deepEqual(c.getCssStyles(), [
                'direction:rtl; text-align:inherit'
            ]);

            o = new DeltaInsertOp(new InsertDataQuill(DataType.Image, ""), {indent: 2});
            c = new OpToHtmlConverter(o, { inlineStyles: {} });
            assert.deepEqual(c.getCssStyles(), [
                'padding-left:6em'
            ]);

            // Ignore invalid direction
            o = new DeltaInsertOp(new InsertDataQuill(DataType.Image, ""), ({direction: 'ltr'} as any));
            c = new OpToHtmlConverter(o, { inlineStyles: {} });
            assert.deepEqual(c.getCssStyles(), []);
        });

        it('should allow setting inline styles', function () {
            var op = new DeltaInsertOp('f', { size: 'huge' });
            var c = new OpToHtmlConverter(op, { inlineStyles: {
               size: {
                  'huge': 'font-size: 6em'
               },
            } });
            assert.deepEqual(c.getCssStyles(), ['font-size: 6em']);
        });

        it('should fall back to defaults for inline styles that are not specified', function () {
            // Here there's no inlineStyle specified for "size", but we still render it
            // because we fall back to the default.
            var op = new DeltaInsertOp('f', { size: 'huge' });
            var c = new OpToHtmlConverter(op, { inlineStyles: {
               font: {
                  'serif': 'font-family: serif'
               },
            } });
            assert.deepEqual(c.getCssStyles(), ['font-size: 2.5em']);
        });

        it('should render default font inline styles correctly', function () {
            var op = new DeltaInsertOp('f', { font: 'monospace' });
            var c = new OpToHtmlConverter(op, { inlineStyles: {} });
            assert.deepEqual(c.getCssStyles(), ['font-family: Monaco, Courier New, monospace']);
        });


        it('should return nothing for an inline style with no mapped entry', function () {
            var op = new DeltaInsertOp('f', { size: 'biggest' });
            var c = new OpToHtmlConverter(op, { inlineStyles: {
               size: {
                  'small': 'font-size: 0.75em'
               },
            } });
            assert.deepEqual(c.getCssStyles(), []);
        });

        it('should return nothing for an inline style where the converter returns undefined', function () {
            var op = new DeltaInsertOp('f', { size: 'biggest' });
            var c = new OpToHtmlConverter(op, { inlineStyles: {
               size: () => undefined,
            } });
            assert.deepEqual(c.getCssStyles(), []);
        });
    });

    describe('getCssClasses()', function () {
        it('should return prefixed classes', () => {
            var op = new DeltaInsertOp("hello");
            var c = new OpToHtmlConverter(op);
            assert.deepEqual(c.getCssClasses(), []);

            var attrs = {
                indent: 1, align: AlignType.Center, direction: DirectionType.Rtl,
                font: 'roman', size: 'small', background: 'red'
            }
            var o = new DeltaInsertOp('f', attrs);
            c = new OpToHtmlConverter(o);
            var classes = ['ql-indent-1', 'ql-align-center', 'ql-direction-rtl',
                'ql-font-roman', 'ql-size-small'];
            assert.deepEqual(c.getCssClasses(), classes);

            o = new DeltaInsertOp(new InsertDataQuill(DataType.Image, ""), attrs);
            c = new OpToHtmlConverter(o);
            assert.deepEqual(c.getCssClasses(), classes.concat('ql-image'));

            o = new DeltaInsertOp(new InsertDataQuill(DataType.Video, ""), attrs);
            c = new OpToHtmlConverter(o);
            assert.deepEqual(c.getCssClasses(), classes.concat('ql-video'));

            o = new DeltaInsertOp(new InsertDataQuill(DataType.Formula, ""), attrs);
            c = new OpToHtmlConverter(o);
            assert.deepEqual(c.getCssClasses(), classes.concat('ql-formula'));

            o = new DeltaInsertOp('f', attrs);
            c = new OpToHtmlConverter(o, {allowBackgroundClasses: true});
            assert.deepEqual(c.getCssClasses(), classes.concat('ql-background-red'));

        });

        it('should return no classes if `inlineStyles` is specified', function () {
            var attrs = {
                indent: 1, align: AlignType.Center, direction: DirectionType.Rtl,
                font: 'roman', size: 'small', background: 'red'
            }
            var o = new DeltaInsertOp('f', attrs);
            var c = new OpToHtmlConverter(o, { inlineStyles: {} });
            assert.deepEqual(c.getCssClasses(), []);
        });
    });

    describe('getTags()', function () {
        it('should return tags to render this op', () => {
            var op = new DeltaInsertOp("hello");
            var c = new OpToHtmlConverter(op);
            assert.deepEqual(c.getTags(), []);

            var o = new DeltaInsertOp("", { code: true });
            c = new OpToHtmlConverter(o);
            assert.deepEqual(c.getTags(), ['code']);

            [['image', 'img'], ['video', 'iframe'], ['formula', 'span']]
                .forEach((item: DataType[]) => {
                    o = new DeltaInsertOp(new InsertDataQuill(item[0], ""));
                    c = new OpToHtmlConverter(o);
                    assert.deepEqual(c.getTags(), [item[1]]);
                });

            [['blockquote', 'blockquote'], ['code-block', 'pre'],
            ['list', 'li'], ['header', 'h2']]
                .forEach((item) => {
                    o = new DeltaInsertOp("", { [item[0]]: true, header: 2 });
                    c = new OpToHtmlConverter(o);
                    assert.deepEqual(c.getTags(), [item[1]]);
                });


            var attrs = {
                link: 'http', script: ScriptType.Sub, bold: true, italic: true,
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

            var o = new DeltaInsertOp("", { code: true, color: 'red' });
            var c = new OpToHtmlConverter(o);
            assert.deepEqual(c.getTagAttributes(), []);

            var o = new DeltaInsertOp(new InsertDataQuill(DataType.Image, "http:"), { color: 'red' });
            var c = new OpToHtmlConverter(o);
            assert.deepEqual(c.getTagAttributes(), [
                { key: 'class', value: "ql-image" },
                { key: 'src', value: "http:" }
            ]);

            var o = new DeltaInsertOp(new InsertDataQuill(DataType.Image, "http:"), { width: '200' });
            var c = new OpToHtmlConverter(o);
            assert.deepEqual(c.getTagAttributes(), [
                { key: 'class', value: "ql-image" },
                { key: 'width', value: "200"},
                { key: 'src', value: "http:" }
            ]);

            var o = new DeltaInsertOp(new InsertDataQuill(DataType.Formula, "-"), { color: 'red' });
            var c = new OpToHtmlConverter(o);
            assert.deepEqual(c.getTagAttributes(), [
                { key: 'class', value: "ql-formula" }
            ]);

            var o = new DeltaInsertOp(new InsertDataQuill(DataType.Video, "http:"), { color: 'red' });
            var c = new OpToHtmlConverter(o);
            assert.deepEqual(c.getTagAttributes(), [
                { key: 'class', value: "ql-video" },
                { key: 'frameborder', value: '0' },
                { key: 'allowfullscreen', value: 'true' },
                { key: 'src', 'value': 'http:' }
            ]);

            var o = new DeltaInsertOp("link", { color: 'red', link: 'l' });

            var c = new OpToHtmlConverter(o);
            assert.deepEqual(c.getTagAttributes(), [
                { key: 'style', value: 'color:red' },
                { key: 'href', value: 'l' }
            ]);

            var c = new OpToHtmlConverter(o, {linkRel: 'nofollow'});
            assert.deepEqual(c.getTagAttributes(), [
                { key: 'style', value: 'color:red' },
                { key: 'href', value: 'l' },
                { key: 'rel', value: 'nofollow' }
            ]);

        });
    });

    describe('getContent()', function () {
        it('should return proper content depending on type', () => {
            var o = new DeltaInsertOp("aa", { indent: 1 });
            var c = new OpToHtmlConverter(o);
            assert.equal(c.getContent(), '');

            o = new DeltaInsertOp('sss<&>,', { bold: true });
            c = new OpToHtmlConverter(o);
            assert.equal(c.getContent(), 'sss&lt;&amp;&gt;,');

            o = new DeltaInsertOp(new InsertDataQuill(DataType.Formula, 'ff'), { bold: true });
            c = new OpToHtmlConverter(o);
            assert.equal(c.getContent(), 'ff');

            o = new DeltaInsertOp(new InsertDataQuill(DataType.Video, 'ff'), { bold: true });
            c = new OpToHtmlConverter(o);
            assert.equal(c.getContent(), '');
        });
    });

    describe('html retrieval', function () {

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
        var c1 = new OpToHtmlConverter(op1);
        var result = [
            '<a class="ql-font-verdana ql-size-small"',
            ' style="color:red;background-color:#fff" href="http://">',
            '<sup>',
            '<strong><em><s><u>aaa</u></s></em></strong>',
            '</sup>',
            '</a>'
        ].join('');

        describe('getHtmlParts()', function () {
            it('should return inline html', () => {
                var op = new DeltaInsertOp("");
                var c1 = new OpToHtmlConverter(op);
                var act = c1.getHtmlParts();
                assert.equal(act.closingTag + act.content + act.openingTag, '');

                c1 = new OpToHtmlConverter(op1);
                act = c1.getHtmlParts();
                assert.equal(act.openingTag + act.content + act.closingTag, result);
            });
        });

        describe('getHtml()', function () {
            it('should return inline html', () => {
                c1 = new OpToHtmlConverter(op1);
                var act = c1.getHtml();
                assert.equal(act, result);


                var op = new DeltaInsertOp("\n", { bold: true });
                c1 = new OpToHtmlConverter(op, {encodeHtml: false});
                assert.equal(c1.getHtml(), '\n');

                var op = new DeltaInsertOp("\n", { color: '#fff' });
                c1 = new OpToHtmlConverter(op);
                assert.equal(c1.getHtml(), '\n');

                var op = new DeltaInsertOp(new InsertDataQuill(DataType.Image, "http://"));
                c1 = new OpToHtmlConverter(op);
                assert.equal(c1.getHtml(), '<img class="ql-image" src="http://"/>');
            });
        });

    });

    describe('#IsValidColorLiteral()', function() {
        it('should return true if color literal is valid', function() {
            assert.ok(OpToHtmlConverter.IsValidRel('nofollow'));
            assert.ok(OpToHtmlConverter.IsValidRel('tag'));
            assert.ok(OpToHtmlConverter.IsValidRel('tag nofollow'));
            assert.equal(OpToHtmlConverter.IsValidRel('no-follow'), false);
            assert.equal(OpToHtmlConverter.IsValidRel('tag1'), false);
            assert.equal(OpToHtmlConverter.IsValidRel(''), false);
        });
    });

});
