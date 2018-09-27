import { makeStartTag, makeEndTag, encodeHtml, encodeLink, ITagKeyValue } from './funcs-html';
import { DeltaInsertOp } from './DeltaInsertOp';
import { ScriptType, NewLine } from './value-types';
import * as url from './helpers/url';
import * as obj from './helpers/object';
import { IMention } from "./mentions/MentionSanitizer";
import * as arr from './helpers/array';
import { OpAttributeSanitizer } from "./OpAttributeSanitizer";


interface IOpToHtmlConverterOptions {
   classPrefix?: string,
   inlineStyles?: boolean,
   encodeHtml?: boolean,
   listItemTag?: string,
   paragraphTag?: string,
   linkRel?: string,
   linkTarget?: string,
   allowBackgroundClasses?: boolean
}

interface IHtmlParts {
   openingTag: string,
   content: string,
   closingTag: string,
}

class OpToHtmlConverter {

   private options: IOpToHtmlConverterOptions;
   private op: DeltaInsertOp;

   constructor(op: DeltaInsertOp, options?: IOpToHtmlConverterOptions) {
      this.op = op;
      this.options = obj.assign({}, {
         classPrefix: 'ql',
         inlineStyles: false,
         encodeHtml: true,
         listItemTag: 'li',
         paragraphTag: 'p'
      }, options);
   }

   prefixClass(className: string): string {
      if (!this.options.classPrefix) {
         return className + '';
      }
      return this.options.classPrefix + '-' + className;
   }

   getHtml(): string {
      var parts = this.getHtmlParts();
      return parts.openingTag + parts.content + parts.closingTag;
   }

   getHtmlParts(): IHtmlParts {

      if (this.op.isJustNewline() && !this.op.isContainerBlock()) {
         return { openingTag: '', closingTag: '', content: NewLine };
      }

      let tags = this.getTags(), attrs = this.getTagAttributes();

      if (!tags.length && attrs.length) {
         tags.push('span');
      }

      let beginTags = [], endTags = [];

      for (var tag of tags) {
         beginTags.push(makeStartTag(tag, attrs));
         endTags.push(tag === 'img' ? '' : makeEndTag(tag));
         // consumed in first tag
         attrs = [];
      }
      endTags.reverse();

      return {
         openingTag: beginTags.join(''),
         content: this.getContent(),
         closingTag: endTags.join('')
      };
   }

   getContent(): string {
      if (this.op.isContainerBlock()) {
         return '';
      }

      if (this.op.isMentions()) {
         return this.op.insert.value;
      }

      var content = this.op.isFormula() || this.op.isText() ? this.op.insert.value : '';

      return this.options.encodeHtml && encodeHtml(content) || content;
   }

   getCssClasses(): string[] {

      var attrs: any = this.op.attributes;

      type Str2StrType = { (x: string): string };

      if(this.options.inlineStyles) {
            return [];
      }

      var propsArr = ['indent', 'align', 'direction', 'font', 'size'];
      if (this.options.allowBackgroundClasses) {
         propsArr.push('background');
      }
      return propsArr
         .filter((prop) => !!attrs[prop])
         .filter((prop) => prop === 'background' ? OpAttributeSanitizer.IsValidColorLiteral(attrs[prop]) : true)
         .map((prop) => prop + '-' + attrs[prop])
         .concat(this.op.isFormula() ? 'formula' : [])
         .concat(this.op.isVideo() ? 'video' : [])
         .concat(this.op.isImage() ? 'image' : [])
         .map(<Str2StrType>this.prefixClass.bind(this));
   }


   getCssStyles(): string[] {
      type Attr = {
            attr: string,
            style: string | ((value: string) => string)
      };

      const STYLE_MAP : { [x: string]: { [x: string]: string } } = {
         font: {
            'serif': 'font-family: Georgia, Times New Roman, serif',
            'monospace': 'font-family: Monaco, Courier New, monospace'
         },
         size: {
            'small': 'font-size: 0.75em',
            'large': 'font-size: 1.5em',
            'huge': 'font-size: 2.5em'
         }
      };

      var attrs: any = this.op.attributes;

      var propsArr : Attr[] = [{ attr: 'color', style: 'color' }];
      if (!this.options.allowBackgroundClasses || this.options.inlineStyles) {
         propsArr.push({ attr: 'background', style: 'background-color' });
      }
      if(this.options.inlineStyles) {
         propsArr = propsArr.concat([
            {
               attr: 'indent',
               style: (value) => {
                  var indentSize = parseInt(value, 10) * 3;
                  var side = attrs['direction'] === 'rtl' ? 'right' : 'left';
                  return 'padding-' + side + ':' + indentSize + 'em';
               }
            },
            {
               attr: 'align',
               style: 'text-align'
            },
            {
               attr: 'direction',
               style: (value) => {
                  if (value === 'rtl') {
                     return 'direction:rtl' + ( attrs['align'] ? '' : '; text-align: inherit' );
                  } else {
                     return '';
                  }
               }
            },
            {
               attr: 'font',
               style: (value) => STYLE_MAP.font[value] || ('font-family:' + value)
            },
            {
               attr: 'size',
               style: (value) => STYLE_MAP.size[value] || ''
            }
         ]);
      }

      return propsArr
         .filter((item) => !!attrs[item.attr])
         .map((item) => {
            if (typeof(item.style) === 'string') {
               return item.style + ':' + attrs[item.attr];
            } else {
               return item.style(attrs[item.attr]);
            }
         })
   }

   getTagAttributes(): Array<ITagKeyValue> {
      if (this.op.attributes.code && !this.op.isLink()) {
         return [];
      }

      const makeAttr = (k: string, v: string): ITagKeyValue => ({ key: k, value: v });

      var classes = this.getCssClasses();
      var tagAttrs = classes.length ? [makeAttr('class', classes.join(' '))] : [];

      if (this.op.isImage()) {
         this.op.attributes.width && (tagAttrs = tagAttrs.concat(makeAttr('width', this.op.attributes.width)));
         return tagAttrs.concat(makeAttr('src', url.sanitize(this.op.insert.value + '')+''));
      }

      if (this.op.isACheckList()) {
         return tagAttrs.concat(makeAttr('data-checked', this.op.isCheckedList() ? 'true' : 'false'))
      }

      if (this.op.isFormula()) {
         return tagAttrs;
      }

      if (this.op.isVideo()) {
         return tagAttrs.concat(
            makeAttr('frameborder', '0'),
            makeAttr('allowfullscreen', 'true'),
            makeAttr('src', url.sanitize(this.op.insert.value + '')+'')
         );
      }

      if (this.op.isMentions()) {
         var mention: IMention = this.op.attributes.mention!;
         if (mention.class) {
            tagAttrs = tagAttrs.concat(makeAttr('class', mention.class));
         }
         if (mention['end-point'] && mention.slug) {
            tagAttrs = tagAttrs.concat(
               makeAttr('href', encodeLink(mention['end-point'] + '/' + mention.slug))
            );
         } else {
            tagAttrs = tagAttrs.concat(makeAttr('href', 'about:blank'));
         }
         if (mention.target) {
            tagAttrs = tagAttrs.concat(makeAttr('target', mention.target));
         }
         return tagAttrs;
      }

      var styles = this.getCssStyles();
      if (styles.length) { tagAttrs.push(makeAttr('style', styles.join(';'))); }

      if (this.op.isContainerBlock()) {
         return tagAttrs;
      }

      if (this.op.isLink()) {
         let target = this.op.attributes.target || this.options.linkTarget;
         tagAttrs = tagAttrs
         .concat(makeAttr('href', encodeLink(this.op.attributes.link!)))
         .concat(target ? makeAttr('target', target) : []);
         if (!!this.options.linkRel && OpToHtmlConverter.IsValidRel(this.options.linkRel)) {
            tagAttrs.push(makeAttr('rel', this.options.linkRel));
         }
      }

      return tagAttrs;
   }

   getTags(): string[] {
      var attrs: any = this.op.attributes;

      // embeds
      if (!this.op.isText()) {
         return [this.op.isVideo() ? 'iframe'
            : this.op.isImage() ? 'img'
               : 'span' // formula
         ]
      }

      // blocks
      var positionTag = this.options.paragraphTag || 'p';

      var blocks = [['blockquote'], ['code-block', 'pre'],
      ['list', this.options.listItemTag], ['header'],
      ['align', positionTag], ['direction', positionTag],
      ['indent', positionTag]];
      for (var item of blocks) {
         var firstItem = item[0]!
         if (attrs[firstItem]) {
            return firstItem === 'header' ? ['h' + attrs[firstItem]] : [arr.preferSecond(item)!];
         }
      }

      // inlines
      return [['link', 'a'], ['mentions', 'a'], ['script'],
      ['bold', 'strong'], ['italic', 'em'], ['strike', 's'], ['underline', 'u'],
      ['code']]
         .filter((item: string[]) => !!attrs[item[0]])
         .map((item) => {
            return item[0] === 'script' ?
               (attrs[item[0]] === ScriptType.Sub ? 'sub' : 'sup')
               : arr.preferSecond(item)!;
         });
   }

   static IsValidRel(relStr: string) {
      return !!relStr.match(/^[a-z\s]{1,50}$/i);
   }

}

export { OpToHtmlConverter, IOpToHtmlConverterOptions, IHtmlParts };
