
import { ListType, AlignType, DirectionType, ScriptType } from './value-types';
import { MentionSanitizer } from "./mentions/MentionSanitizer";
import * as url from './helpers/url';
import {encodeLink} from "./funcs-html";
import { IMention } from "./mentions/MentionSanitizer";

interface IOpAttributes {
   background?: string | undefined,
   color?: string | undefined,
   font?: string | undefined,
   size?: string | undefined,
   width?: string | undefined,

   link?: string | undefined,
   bold?: boolean | undefined,
   italic?: boolean | undefined,
   underline?: boolean | undefined,
   strike?: boolean | undefined,
   script?: ScriptType,

   code?: boolean | undefined,

   list?: ListType,
   blockquote?: boolean | undefined,
   'code-block'?: boolean | undefined,
   header?: number | undefined,
   align?: AlignType,
   direction?: DirectionType,
   indent?: number | undefined,

   mentions?: boolean | undefined,
   mention?: IMention | undefined,
   target?: string | undefined,

   // should this custom blot be rendered as block?
   renderAsBlock?: boolean | undefined
}

interface IUrlSanitizerFn {
   (url: string): string | undefined
}
interface IOpAttributeSanitizerOptions {
   urlSanitizer?: IUrlSanitizerFn
}

class OpAttributeSanitizer {

   static sanitize(dirtyAttrs: IOpAttributes, sanitizeOptions: IOpAttributeSanitizerOptions): IOpAttributes {

      var cleanAttrs: any = {};

      if (!dirtyAttrs || typeof dirtyAttrs !== 'object') {
         return cleanAttrs;
      }
      let booleanAttrs = [
         'bold', 'italic', 'underline', 'strike', 'code',
         'blockquote', 'code-block','renderAsBlock'
      ];

      let colorAttrs = ['background', 'color'];

      let { font, size, link, script, list, header, align,
         direction, indent, mentions, mention, width, target
      } = dirtyAttrs;

      let sanitizedAttrs = [...booleanAttrs, ...colorAttrs,
         'font', 'size', 'link', 'script', 'list', 'header', 'align',
         'direction', 'indent', 'mentions', 'mention', 'width'
      ];
      booleanAttrs.forEach(function (prop: string) {
         var v = (<any>dirtyAttrs)[prop];
         if (v) {
            cleanAttrs[prop] = !!v;
         }
      });

      colorAttrs.forEach(function (prop: string) {
         var val = (<any>dirtyAttrs)[prop];
         if (val && (OpAttributeSanitizer.IsValidHexColor(val + '') ||
            OpAttributeSanitizer.IsValidColorLiteral(val + '') ||
            OpAttributeSanitizer.IsValidRGBColor(val + ''))) {
            cleanAttrs[prop] = val;
         }
      });

      if (font && OpAttributeSanitizer.IsValidFontName(font + '')) {
         cleanAttrs.font = font;
      }

      if (size && OpAttributeSanitizer.IsValidSize(size + '')) {
         cleanAttrs.size = size;
      }

      if (width && OpAttributeSanitizer.IsValidWidth(width + '')) {
         cleanAttrs.width = width;
      }

      if (link) {
         cleanAttrs.link = OpAttributeSanitizer.sanitizeLinkUsingOptions(link + '', sanitizeOptions);
      }
      if (target && OpAttributeSanitizer.isValidTarget(target)) {
         cleanAttrs.target = target;
      }

      if (script === ScriptType.Sub || ScriptType.Super === script) {
         cleanAttrs.script = script;
      }

      if (list === ListType.Bullet || list === ListType.Ordered || list === ListType.Checked || list === ListType.Unchecked) {
         cleanAttrs.list = list;
      }

      if (Number(header)) {
         cleanAttrs.header = Math.min(Number(header), 6);
      }

      if (align === AlignType.Center || align === AlignType.Right || align === AlignType.Justify) {
         cleanAttrs.align = align;
      }

      if (direction === DirectionType.Rtl) {
         cleanAttrs.direction = direction;
      }

      if (indent && Number(indent)) {
         cleanAttrs.indent = Math.min(Number(indent), 30);
      }

      if (mentions && mention) {
         let sanitizedMention = MentionSanitizer.sanitize(mention, sanitizeOptions);
         if (Object.keys(sanitizedMention).length > 0) {
            cleanAttrs.mentions = !!mentions;
            cleanAttrs.mention = mention;
         }
      }
      return Object.keys(dirtyAttrs).reduce((cleaned, k) => {
         // this is a custom attr, put it back
         if (sanitizedAttrs.indexOf(k) === -1) {
            cleaned[k] = (<any>dirtyAttrs)[k];
         };
         return cleaned;
      }, cleanAttrs);
   }

   static sanitizeLinkUsingOptions(link: string, options: IOpAttributeSanitizerOptions) {
      let sanitizerFn: IUrlSanitizerFn = () => { return undefined; };
      if (options && typeof options.urlSanitizer === 'function') {
         sanitizerFn = options.urlSanitizer;
      }
      let result = sanitizerFn(link);
      return typeof result === 'string' ? 
         result : 
         encodeLink(url.sanitize(link));
   }
   static IsValidHexColor(colorStr: string) {
      return !!colorStr.match(/^#([0-9A-F]{6}|[0-9A-F]{3})$/i);
   }

   static IsValidColorLiteral(colorStr: string) {
      return !!colorStr.match(/^[a-z]{1,50}$/i);
   }

   static IsValidRGBColor(colorStr: string) {
       const re = /^rgb\(((0|25[0-5]|2[0-4]\d|1\d\d|0?\d?\d),\s*){2}(0|25[0-5]|2[0-4]\d|1\d\d|0?\d?\d)\)$/i
       return !!colorStr.match(re);
   }

   static IsValidFontName(fontName: string) {
      return !!fontName.match(/^[a-z\s0-9\- ]{1,30}$/i)
   }

   static IsValidSize(size: string) {
      return !!size.match(/^[a-z0-9\-]{1,20}$/i)
   }

   static IsValidWidth(width: string) {
      return !!width.match(/^[0-9]*(px|em|%)?$/)
   }

   static isValidTarget(target: string) {
      return !!target.match(/^[_a-zA-Z0-9\-]{1,50}$/);
   }
}

export { OpAttributeSanitizer, IOpAttributes, IOpAttributeSanitizerOptions }
