
import { IOpAttributes } from './IOpAttributes';
import { ListType, AlignType, DirectionType, ScriptType } from './value-types';
import { scrubUrl } from './funcs-misc';

class OpAttributeSanitizer {

    static sanitize(dirtyAttrs: IOpAttributes): IOpAttributes {

        var cleanAttrs: any = {};

        if (!dirtyAttrs || typeof dirtyAttrs !== 'object') {
            return cleanAttrs;
        }

        let {
            font, size, link, script, list, header, align, direction, indent
        } = dirtyAttrs;

        ['bold', 'italic', 'underline', 'strike', 'code', 'blockquote', 'code-block']
            .forEach(function (prop: string) {
                cleanAttrs[prop] = !!(<any>dirtyAttrs)[prop];
            });

        ['background', 'color'].forEach(function (prop: string) {
            var val = (<any>dirtyAttrs)[prop];
            if (val && OpAttributeSanitizer.IsValidHexColor(val + '')) {
                cleanAttrs[prop] = val;
            }
        });

        if (font && OpAttributeSanitizer.IsValidFontName(font + '')) {
            cleanAttrs.font = font;
        }

        if (size && OpAttributeSanitizer.IsValidSize(size + '')) {
            cleanAttrs.size = size;
        }

        if (link) {
            cleanAttrs.link = scrubUrl(link);
        }

        if (script === ScriptType.Sub || ScriptType.Super === script) {
            cleanAttrs.script = script;
        }

        if (list === ListType.Bullet || list === ListType.Ordered) {
            cleanAttrs.list = list;
        }

        if (header && parseInt(header + '', 10) > 0) {
            cleanAttrs.header = Math.min(parseInt(header + '', 10), 6);
        }

        if (align === AlignType.Center || align === AlignType.Right) {
            cleanAttrs.align = align;
        }

        if (direction === DirectionType.Rtl) {
            cleanAttrs.direction = direction;
        }

        if (indent && parseInt(indent + '', 10) > 0) {
            cleanAttrs.indent = Math.min(parseInt(indent + '', 10), 30);
        }

        return <IOpAttributes>cleanAttrs;
    }

    static IsValidHexColor(colorStr: string) {
        return !!colorStr.match(/^#([0-9A-F]{6}|[0-9A-F]{3})$/i);
    }

    static IsValidFontName(fontName: string) {
        return !!fontName.match(/^[a-z\s0-9\- ]{1,30}$/i)
    }

    static IsValidSize(size: string) {
        return !!size.match(/^[a-z\-]{1,20}$/i)
    }
}

export { OpAttributeSanitizer }