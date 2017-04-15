
import 'mocha';
import * as assert from 'assert';

import {OpAttributeSanitizer} from './../src/OpAttributeSanitizer';

describe('OpAttributeSanitizer', function () {

    describe('#IsValidHexColor()', function() {
        it('should return true if hex color is valid', function() {
            assert.ok(OpAttributeSanitizer.IsValidHexColor('#234'));
            assert.ok(OpAttributeSanitizer.IsValidHexColor('#f23'));
            assert.ok(OpAttributeSanitizer.IsValidHexColor('#fFe234'));
            assert.equal(OpAttributeSanitizer.IsValidHexColor('#g34'), false);

            assert.equal(OpAttributeSanitizer.IsValidHexColor('e34'), false);
            assert.equal(OpAttributeSanitizer.IsValidHexColor('123434'), false);
        });
    });

    describe('#IsValidFontName()', function() {
        it('should return true if font name is valid', function() {
            assert.ok(OpAttributeSanitizer.IsValidFontName('gooD-ol times 2'));
            assert.equal(OpAttributeSanitizer.IsValidHexColor('bad"times?'), false);
        });
    });

    describe('#IsValidSize()', function() {
        it('should return true if size is valid', function() {
            assert.ok(OpAttributeSanitizer.IsValidSize('bigfaT-size'));
            assert.equal(OpAttributeSanitizer.IsValidSize('small.sizetimes?'), false);
        });
    });

    describe('#sanitize()', function() {

        it('should return empty object', function() {
            [null, 3, undefined, "fd"].forEach((v) => {
                assert.deepEqual(OpAttributeSanitizer.sanitize(v), {});
            });
        });

        var attrs = {
            bold: 'nonboolval',
            color: '#12345H',
            background: '#333',
            font: 'times new roman',
            size: 'x.large',
            link: 'http://<',
            script: 'supper',
            list: 'ordered',
            header: '3',
            indent: 40,
            direction: 'rtl',
            align: 'center'
        };
        it('should return sanitized attributes', function() {
            assert.deepEqual(OpAttributeSanitizer.sanitize(attrs), {
                bold: false,
                background: '#333',
                font: 'times new roman',
                link: 'http://',
                list: 'ordered',
                header: 3,
                indent: 30,
                direction: 'rtl',
                align: 'center'
            });
        });
    });
});