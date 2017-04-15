
import 'mocha';
import * as assert from 'assert';

import {DeltaInsertOp} from './../src/DeltaInsertOp';

import {
    QuillDeltaToHtmlConverter
} from "./../src/QuillDeltaToHtmlConverter";

var data = [
    
        {"ops":[
            {"insert":"This "},
            {"attributes":{"font":"monospace"},"insert":"is"},
            {"insert":" a "},{"attributes":{"size":"large"},"insert":"test"},
            {"insert":" "},
            {"attributes":{"italic":true,"bold":true},"insert":"data"},
            {"insert":" "},
            {"attributes":{"underline":true,"strike":true},"insert":"that"},
            {"insert":" is "},{"attributes":{"color":"#e60000"},"insert":"will"},
            {"insert":" "},{"attributes":{"background":"#ffebcc"},"insert":"test"},
            {"insert":" "},{"attributes":{"script":"sub"},"insert":"the"},
            {"insert":" "},{"attributes":{"script":"super"},"insert":"rendering"},
            {"insert":" of "},{"attributes":{"link":"yahoo"},"insert":"inline"},
            {"insert":" "},
            {"insert":{"formula":"x=data"}},
            {"insert":" formats.\n"}
        ],
        html:[
            '<p>','This ','<span class="noz-font-monospace">is</span>',
            ' a ', '<span class="noz-size-large">test</span>',' ',
            '<strong><em>data</em></strong>',' ',
            '<s><u>that</u></s>',
            ' is ', '<span style="color:#e60000">will</span>', ' ',
            '<span style="background-color:#ffebcc">test</span>', ' ',
            '<sub>the</sub>',' ', '<sup>rendering</sup>',' of ',
            '<a href="yahoo">inline</a>',' ','<span class="noz-formula">x=data</span>',
            ' formats.<br /></p>'
            ].join('')
        }

    
]

describe('QuillDeltaToHtmlConverter', function () {

    describe('constructor()', function () {
        data.forEach((d) => {
            it('should instantiate return proper html', function () {
                var qdc = new QuillDeltaToHtmlConverter(d.ops, {classPrefix: 'noz'});
                var html = qdc.convert();
                assert.equal(html, d.html);

            });
        });
    });

    describe('getListTag()', function () {
        data.forEach((d) => {
            it('should return proper list tag', function () {
                var op = new DeltaInsertOp("d", {list: 'ordered'});
                var qdc = new QuillDeltaToHtmlConverter(d.ops)
                assert.equal(qdc.getListTag(op), 'ol');

                var op = new DeltaInsertOp("d", {list: 'bullet'});
                assert.equal(qdc.getListTag(op), 'ul');

            });
        });
    });
});
