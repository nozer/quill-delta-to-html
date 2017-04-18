
import 'mocha';
import * as assert from 'assert';

import {DeltaInsertOp} from './../src/DeltaInsertOp';
import {OpToHtmlConverter} from './../src/OpToHtmlConverter'; 
import { QuillDeltaToHtmlConverter } from "./../src/QuillDeltaToHtmlConverter";
import {callWhenAlltrue} from './_helper';

import {delta1} from './data/delta1';

describe('QuillDeltaToHtmlConverter', function () {

    describe('constructor()', function () {
        it('should instantiate return proper html', function () {
            
            var qdc = new QuillDeltaToHtmlConverter(delta1.ops, 
                {classPrefix:'noz'});
            var html = qdc.convert();
            assert.equal(html, delta1.html);
        });
    });

    describe("convert()", function(){
        var ops2 = [
            {insert: "this is text"},
            {insert: "\n"},
            {insert: "this is code"},
            {insert: "\n", attributes: {'code-block': true}},
            {insert: "this is code TOO!"},
            {insert: "\n", attributes: {'code-block': true}},
        ];

        it('should render html', function(){
            var qdc = new QuillDeltaToHtmlConverter(ops2);
            
            var html = qdc.convert();
            assert.equal(html.indexOf('<pre>this is code') > -1, true);
        });
    });

    describe('getListTag()', function () {
        
        it('should return proper list tag', function () {
            var op = new DeltaInsertOp("d", {list: 'ordered'});
            var qdc = new QuillDeltaToHtmlConverter(delta1.ops)
            assert.equal(qdc.getListTag(op), 'ol');

            var op = new DeltaInsertOp("d", {list: 'bullet'});
            assert.equal(qdc.getListTag(op), 'ul');

        });
    });

    describe(' prepare data before inline and container renders', function(){
        var ops: any; 
        beforeEach(function(){
            ops = [
                {insert: 'Hello'}, 
                {insert: ' my ', attributes:{italic:true}},
                {insert: '\n', attributes:{italic:true}},
                {insert: ' name is joey'}
            ].map((v: any) => new DeltaInsertOp(v.insert, v.attributes));
        });
    
        describe('renderInlines()', function () {
            it('should render inlines', function () {
                var qdc = new QuillDeltaToHtmlConverter([]);
                var inlines = qdc.renderInlines(ops);
                assert.equal(inlines, ['<p>Hello', 
                    '<em> my </em><br/> name is joey</p>'].join(''));

                qdc = new QuillDeltaToHtmlConverter([], {paragraphTag: 'div'});
                var inlines = qdc.renderInlines(ops);
                assert.equal(inlines, 
                    '<div>Hello<em> my </em><br/> name is joey</div>');

                qdc = new QuillDeltaToHtmlConverter([], {paragraphTag:''});
                var inlines = qdc.renderInlines(ops);
                assert.equal(inlines, 'Hello<em> my </em><br/> name is joey');
            });

            it('should render plain new line string', function () {
                var ops = [new DeltaInsertOp("\n")];
                var qdc = new QuillDeltaToHtmlConverter([]);
                assert.equal(qdc.renderInlines(ops), '<p><br/></p>');
            });

            it('should render styled new line string', function () {
                var ops = [new DeltaInsertOp("\n", {font: 'arial'})];
                var qdc = new QuillDeltaToHtmlConverter([]);
                assert.equal(qdc.renderInlines(ops), 
                    '<p><br/></p>');

                var qdc = new QuillDeltaToHtmlConverter([], {paragraphTag: ''});
                assert.equal(qdc.renderInlines(ops),  '<br/>');
            });

            it('should render when first line is new line', function () {
                var ops = [new DeltaInsertOp("\n"), new DeltaInsertOp("aa")];
                var qdc = new QuillDeltaToHtmlConverter([]);
                assert.equal(qdc.renderInlines(ops), '<p><br/>aa</p>');
            });

            it('should render when last line is new line', function () {
                var ops = [ new DeltaInsertOp("aa"), new DeltaInsertOp("\n")];
                var qdc = new QuillDeltaToHtmlConverter([]);
                assert.equal(qdc.renderInlines(ops), '<p>aa<br/></p>');
            });

            it('should render mixed lines', function () {
                var ops = [ new DeltaInsertOp("aa"), new DeltaInsertOp("bb")];
                var nlop = new DeltaInsertOp("\n");
                var stylednlop = new DeltaInsertOp("\n", {color: '#333', italic: true});
                var qdc = new QuillDeltaToHtmlConverter([]);
                assert.equal(qdc.renderInlines(ops), '<p>aabb</p>');

                var ops0 = [nlop, ops[0], nlop, ops[1]]
                assert.equal(qdc.renderInlines(ops0), '<p><br/>aa<br/>bb</p>');

                var ops4 = [ops[0], stylednlop, stylednlop, stylednlop, ops[1]]
                assert.equal(qdc.renderInlines(ops4), 
                    ['<p>aa<br/><br/><br/>bb</p>'].join(''));
            });

        });

        describe('renderContainerBlock()', function () {
            var op = new DeltaInsertOp('\n', {blockquote: true, indent: 2});
            var inlineop = new DeltaInsertOp("hi there"); 
            it('should render container block', function () {

                var qdc = new QuillDeltaToHtmlConverter([]);
                var blockhtml  = qdc.renderContainerBlock(op, [inlineop]);
                assert.equal(blockhtml, ['<blockquote class="ql-indent-2">',
                    'hi there</blockquote>'].join(''));

                var qdc = new QuillDeltaToHtmlConverter([]);
                var blockhtml  = qdc.renderContainerBlock(op, []);
                assert.equal(blockhtml, ['<blockquote class="ql-indent-2">',
                    '<br/></blockquote>'].join(''));

            });
        });

        describe('shouldBeginList()', function () {
            var qdc = new QuillDeltaToHtmlConverter([]);
            it('should decide if ol/ul list tag should be put', function(){
                var pop = new DeltaInsertOp("fdf");
                var nop = new DeltaInsertOp("fd");
                assert.ok(!qdc.shouldBeginList(pop, nop));

                var nop = new DeltaInsertOp("\n", {list: 'bullet'});
                assert.ok(qdc.shouldBeginList(pop, nop));

                var nop = new DeltaInsertOp("\n", {list: 'bullet'});
                var pop = new DeltaInsertOp("\n", {list: 'ordered'});
                assert.ok(qdc.shouldBeginList(pop, nop));

                var pop = new DeltaInsertOp("\n", {list: 'bullet'});
                var nop = new DeltaInsertOp("\n", {list: 'bullet', indent: 1});
                assert.ok(!qdc.shouldBeginList(pop, nop));
            });
        });

        describe('shouldEndList()', function () {
            var qdc = new QuillDeltaToHtmlConverter([]);
            it('should decide if ol/ul list tag should be closed', function(){
                var pop = new DeltaInsertOp("fdf");
                var nop = new DeltaInsertOp("fd");
                assert.ok(!qdc.shouldEndList(pop, nop));

                var pop = new DeltaInsertOp("\n", {list: 'bullet'});
                assert.ok(qdc.shouldEndList(pop, nop));

                var nop = new DeltaInsertOp("\n", {list: 'bullet'});
                var pop = new DeltaInsertOp("\n", {list: 'ordered'});
                assert.ok(qdc.shouldEndList(pop, nop));

                var pop = new DeltaInsertOp("\n", {list: 'bullet'});
                var nop = new DeltaInsertOp("\n", {list: 'bullet', indent: 1});
                assert.ok(!qdc.shouldEndList(pop, nop));
            });
        });

        describe('before n after renders()', function () {
            var ops = [
                {insert: 'hello'},
                {insert: '\n'},
                {insert: 'how r u?'},
                {insert: 'r u fine'},
                {insert :'\n', attributes: {blockquote: true}},
                {insert: {video: 'http://'}}
            ]
            var qdc = new QuillDeltaToHtmlConverter(ops);
            
            it('should call before/afterContainerBlockRender', function(done){
                var jobstatus1 = [false, false];
                qdc.beforeContainerBlockRender((op, ops) => {
                    assert.ok(op.attributes.blockquote);
                    assert.ok(ops.length === 2);
                    jobstatus1[0] = true;
                    return '';
                });
                qdc.afterContainerBlockRender((html) => {
                    assert.ok(html.indexOf('fine') > -1);
                    jobstatus1[1] = true;
                    return html;
                });
                qdc.convert();
                callWhenAlltrue(jobstatus1, done);
            });

            it('should call before/afterDataBlockRender', function(done){
                var jobstatus = [false, false];
                qdc.beforeDataBlockRender((op) => {
                    assert.ok(op.insert.type === 'video');
                    jobstatus[0] = true;
                    return '';
                });
                qdc.afterDataBlockRender((html) => {
                    assert.ok(html.indexOf('<iframe') > -1);
                    jobstatus[1] = true;
                    return html;
                });
                qdc.convert();
                callWhenAlltrue(jobstatus, done);
                
            });

            it('should call before/afterInlineGroupRender', function(done){
                var jobstatus = [false, false];
                qdc.beforeInlineGroupRender((ops) => {
                    assert.ok(ops[1].insert.value === '\n');
                    jobstatus[0] = true;
                    return '';
                });
                qdc.afterInlineGroupRender((html) => {
                    assert.ok(html.indexOf('lo<br/>') > -1);
                    jobstatus[1] = true;
                    return html;
                });
                var v = qdc.convert();
                callWhenAlltrue(jobstatus, function(){
                    assert.ok(v.indexOf('blockquote>how') > -1);
                    done();
                });
                
            });
        });
    });
});
