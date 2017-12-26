
import { IOpAttributes } from './IOpAttributes';
import { ListType, AlignType, DirectionType, ScriptType } from './value-types';
import './extensions/String';

class OpAttributeSanitizer {

    static sanitize(dirtyAttrs: IOpAttributes): IOpAttributes {

        var cleanAttrs: any = {};

        if (!dirtyAttrs || typeof dirtyAttrs !== 'object') {
            return cleanAttrs;
        }

        let {
            font, size, link, script, list, header, align, direction, indent, 
            mentions, width
        } = dirtyAttrs;

        ['bold', 'italic', 'underline', 'strike', 'code', 'blockquote', 'code-block']
            .forEach(function (prop: string) {
                var v = (<any>dirtyAttrs)[prop];
                if (v) {
                    cleanAttrs[prop] = !!v ;
                }
            });

        ['background', 'color'].forEach(function (prop: string) {
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

        if (mentions) {
            let { mention } = dirtyAttrs;
            cleanAttrs.mentions = mentions;
            cleanAttrs.mention = mention;
        }

        return cleanAttrs;
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
        return !!width.match(/^[0-9]*$/)
    }
}

export { OpAttributeSanitizer }
