
import { ListType, AlignType, DirectionType, ScriptType } from './value-types';
import { MentionSanitizer } from "./mentions/MentionSanitizer";
import './extensions/String';
import { IMention } from "./mentions/MentionSanitizer";

interface IOpAttributes {
   background?: string,
   color?: string,
   font?: string,
   size?: string,
   width?: string,

   link?: string,
   bold?: boolean,
   italic?: boolean,
   underline?: boolean,
   strike?: boolean,
   script?: ScriptType,

   code?: boolean,

   list?: ListType,
   blockquote?: boolean,
   'code-block'?: boolean,
   header?: number,
   align?: AlignType,
   direction?: DirectionType,
   indent?: number,

   mentions?: boolean,
   mention?: IMention
}

class OpAttributeSanitizer {

   static sanitize(dirtyAttrs: IOpAttributes): IOpAttributes {

      var cleanAttrs: any = {};

      if (!dirtyAttrs || typeof dirtyAttrs !== 'object') {
         return cleanAttrs;
      }
      let booleanAttrs = [
         'bold', 'italic', 'underline', 'strike', 'code',
         'blockquote', 'code-block'
      ];

      let colorAttrs = ['background', 'color'];

      let { font, size, link, script, list, header, align, 
         direction, indent, mentions, mention, width
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
            OpAttributeSanitizer.IsValidColorLiteral(val + ''))) {
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
         cleanAttrs.link = (link + '')._scrubUrl();
      }

      if (script === ScriptType.Sub || ScriptType.Super === script) {
         cleanAttrs.script = script;
      }

      if (list === ListType.Bullet || list === ListType.Ordered) {
         cleanAttrs.list = list;
      }

      if (Number(header)) {
         cleanAttrs.header = Math.min(Number(header), 6);
      }

      if (align === AlignType.Center || align === AlignType.Right) {
         cleanAttrs.align = align;
      }

      if (direction === DirectionType.Rtl) {
         cleanAttrs.direction = direction;
      }

      if (indent && Number(indent)) {
         cleanAttrs.indent = Math.min(Number(indent), 30);
      }

      if (mentions && mention) {
         let sanitizedMention = MentionSanitizer.sanitize(mention);
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

   static IsValidHexColor(colorStr: string) {
      return !!colorStr.match(/^#([0-9A-F]{6}|[0-9A-F]{3})$/i);
   }

   static IsValidColorLiteral(colorStr: string) {
      return !!colorStr.match(/^[a-z]{1,50}$/i);
   }

   static IsValidFontName(fontName: string) {
      return !!fontName.match(/^[a-z\s0-9\- ]{1,30}$/i)
   }

   static IsValidSize(size: string) {
      return !!size.match(/^[a-z\-]{1,20}$/i)
   }

   static IsValidWidth(width: string) {
    return !!width.match(/^[0-9]*(px|em|%)?$/)
   }
}

export { OpAttributeSanitizer, IOpAttributes }
