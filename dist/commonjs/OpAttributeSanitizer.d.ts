import { ListType, AlignType, DirectionType, ScriptType } from './value-types';
import { IMention } from "./mentions/MentionSanitizer";
interface IOpAttributes {
    background?: string | undefined;
    color?: string | undefined;
    font?: string | undefined;
    size?: string | undefined;
    width?: string | undefined;
    link?: string | undefined;
    bold?: boolean | undefined;
    italic?: boolean | undefined;
    underline?: boolean | undefined;
    strike?: boolean | undefined;
    script?: ScriptType;
    code?: boolean | undefined;
    list?: ListType;
    blockquote?: boolean | undefined;
    'code-block'?: boolean | undefined;
    header?: number | undefined;
    align?: AlignType;
    direction?: DirectionType;
    indent?: number | undefined;
    mentions?: boolean | undefined;
    mention?: IMention | undefined;
    target?: string | undefined;
    renderAsBlock?: boolean | undefined;
}
interface IUrlSanitizerFn {
    (url: string): string | undefined;
}
interface IOpAttributeSanitizerOptions {
    urlSanitizer?: IUrlSanitizerFn;
}
declare class OpAttributeSanitizer {
    static sanitize(dirtyAttrs: IOpAttributes, sanitizeOptions: IOpAttributeSanitizerOptions): IOpAttributes;
    static sanitizeLinkUsingOptions(link: string, options: IOpAttributeSanitizerOptions): string;
    static IsValidHexColor(colorStr: string): boolean;
    static IsValidColorLiteral(colorStr: string): boolean;
    static IsValidRGBColor(colorStr: string): boolean;
    static IsValidFontName(fontName: string): boolean;
    static IsValidSize(size: string): boolean;
    static IsValidWidth(width: string): boolean;
    static isValidTarget(target: string): boolean;
}
export { OpAttributeSanitizer, IOpAttributes, IOpAttributeSanitizerOptions };
