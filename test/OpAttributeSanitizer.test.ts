import 'mocha';
import * as assert from 'assert';

import { OpAttributeSanitizer } from './../src/OpAttributeSanitizer';
import { ListType, AlignType, DirectionType } from './../src/value-types';

describe('OpAttributeSanitizer', function () {
  describe('#IsValidHexColor()', function () {
    it('should return true if hex color is valid', function () {
      assert.ok(OpAttributeSanitizer.IsValidHexColor('#234'));
      assert.ok(OpAttributeSanitizer.IsValidHexColor('#f23'));
      assert.ok(OpAttributeSanitizer.IsValidHexColor('#fFe234'));
      assert.equal(OpAttributeSanitizer.IsValidHexColor('#g34'), false);

      assert.equal(OpAttributeSanitizer.IsValidHexColor('e34'), false);
      assert.equal(OpAttributeSanitizer.IsValidHexColor('123434'), false);
    });
  });

  describe('#IsValidFontName()', function () {
    it('should return true if font name is valid', function () {
      assert.ok(OpAttributeSanitizer.IsValidFontName('gooD-ol times 2'));
      assert.equal(OpAttributeSanitizer.IsValidHexColor('bad"times?'), false);
    });
  });

  describe('#IsValidSize()', function () {
    it('should return true if size is valid', function () {
      assert.ok(OpAttributeSanitizer.IsValidSize('bigfaT-size'));
      assert.equal(OpAttributeSanitizer.IsValidSize('small.sizetimes?'), false);
    });
  });

  describe('#IsValidWidth()', function () {
    it('should return true if width is valid', function () {
      assert.ok(OpAttributeSanitizer.IsValidWidth('150'));
      assert.ok(OpAttributeSanitizer.IsValidWidth('100px'));
      assert.ok(OpAttributeSanitizer.IsValidWidth('150em'));
      assert.ok(OpAttributeSanitizer.IsValidWidth('10%'));
      assert.equal(OpAttributeSanitizer.IsValidWidth('250%px'), false);
      assert.equal(OpAttributeSanitizer.IsValidWidth('250% border-box'), false);
      assert.equal(OpAttributeSanitizer.IsValidWidth('250.80'), false);
      assert.equal(OpAttributeSanitizer.IsValidWidth('250x'), false);
    });
  });

  describe('#IsValidColorLiteral()', function () {
    it('should return true if color literal is valid', function () {
      assert.ok(OpAttributeSanitizer.IsValidColorLiteral('yellow'));
      assert.ok(OpAttributeSanitizer.IsValidColorLiteral('r'));
      assert.equal(OpAttributeSanitizer.IsValidColorLiteral('#234'), false);
      assert.equal(OpAttributeSanitizer.IsValidColorLiteral('#fFe234'), false);
      assert.equal(OpAttributeSanitizer.IsValidColorLiteral('red1'), false);
      assert.equal(
        OpAttributeSanitizer.IsValidColorLiteral('red-green'),
        false
      );
      assert.equal(OpAttributeSanitizer.IsValidColorLiteral(''), false);
    });
  });

  describe('#IsValidRGBColor()', function () {
    it('should return true if rgb color is valid', function () {
      assert.ok(OpAttributeSanitizer.IsValidRGBColor('rgb(0,0,0)'));
      assert.ok(OpAttributeSanitizer.IsValidRGBColor('rgb(255, 99, 1)'));
      assert.ok(OpAttributeSanitizer.IsValidRGBColor('RGB(254, 249, 109)'));
      assert.equal(OpAttributeSanitizer.IsValidRGBColor('yellow'), false);
      assert.equal(OpAttributeSanitizer.IsValidRGBColor('#FFF'), false);
      assert.equal(OpAttributeSanitizer.IsValidRGBColor('rgb(256,0,0)'), false);
      assert.equal(OpAttributeSanitizer.IsValidRGBColor('rgb(260,0,0)'), false);
      assert.equal(
        OpAttributeSanitizer.IsValidRGBColor('rgb(2000,0,0)'),
        false
      );
    });
  });
  describe('#IsValidRel()', function () {
    it('should return true if rel is valid', function () {
      assert.ok(OpAttributeSanitizer.IsValidRel('nofollow'));
      assert.ok(OpAttributeSanitizer.IsValidRel('tag'));
      assert.ok(OpAttributeSanitizer.IsValidRel('tag nofollow'));
      assert.equal(OpAttributeSanitizer.IsValidRel('no"follow'), false);
      assert.equal(OpAttributeSanitizer.IsValidRel('tag1'), false);
      assert.equal(OpAttributeSanitizer.IsValidRel(''), false);
    });
  });
  describe('#IsValidLang()', function () {
    it('should return true if lang is valid', function () {
      assert.ok(OpAttributeSanitizer.IsValidLang('javascript'));
      assert.ok(OpAttributeSanitizer.IsValidLang(true));
      assert.ok(OpAttributeSanitizer.IsValidLang('C++'));
      assert.ok(OpAttributeSanitizer.IsValidLang('HTML/XML'));
      assert.equal(OpAttributeSanitizer.IsValidLang('lang"uage'), false);
      assert.equal(OpAttributeSanitizer.IsValidLang(''), false);
    });
  });

  describe('#sanitize()', function () {
    it('should return empty object', function () {
      [null, 3, undefined, 'fd'].forEach((v) => {
        assert.deepEqual(OpAttributeSanitizer.sanitize(<any>v, {}), {});
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
      list: ListType.Ordered,
      header: '3',
      indent: 40,
      direction: DirectionType.Rtl,
      align: AlignType.Center,
      width: '3',
      customAttr1: 'shouldnt be touched',
      mentions: true,
      mention: {
        class: 'A-cls-9',
        id: 'An-id_9:.',
        target: '_blank',
        avatar: 'http://www.yahoo.com',
        'end-point': 'http://abc.com',
        slug: 'my-name',
      },
    };
    it('should return sanitized attributes', function () {
      assert.deepEqual(OpAttributeSanitizer.sanitize(<any>attrs, {}), {
        bold: true,
        background: '#333',
        font: 'times new roman',
        link: 'http://&lt;',
        list: 'ordered',
        header: 3,
        indent: 30,
        direction: 'rtl',
        align: 'center',
        width: '3',
        customAttr1: 'shouldnt be touched',
        mentions: true,
        mention: {
          class: 'A-cls-9',
          id: 'An-id_9:.',
          target: '_blank',
          avatar: 'http://www.yahoo.com',
          'end-point': 'http://abc.com',
          slug: 'my-name',
        },
      });

      assert.deepEqual(
        OpAttributeSanitizer.sanitize(
          <any>{
            mentions: true,
            mention: 1,
          },
          {}
        ),
        {}
      );

      assert.deepEqual(OpAttributeSanitizer.sanitize({ header: 1 }, {}), {
        header: 1,
      });
      assert.deepEqual(
        OpAttributeSanitizer.sanitize({ header: undefined }, {}),
        {}
      );
      assert.deepEqual(OpAttributeSanitizer.sanitize({ header: 100 }, {}), {
        header: 6,
      });
      assert.deepEqual(
        OpAttributeSanitizer.sanitize({ align: AlignType.Center }, {}),
        { align: 'center' }
      );
      assert.deepEqual(
        OpAttributeSanitizer.sanitize({ direction: DirectionType.Rtl }, {}),
        { direction: 'rtl' }
      );
      assert.deepEqual(OpAttributeSanitizer.sanitize({ indent: 2 }, {}), {
        indent: 2,
      });
    });
  });
});
