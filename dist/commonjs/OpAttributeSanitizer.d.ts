import { ListType, AlignType, DirectionType, ScriptType } from './value-types';
import './extensions/String';
import { IMention } from "./mentions/MentionSanitizer";
interface IOpAttributes {
    background?: string;
    color?: string;
    font?: string;
    size?: string;
    width?: string;
    link?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    script?: ScriptType;
    code?: boolean;
    list?: ListType;
    blockquote?: boolean;
    'code-block'?: boolean;
    header?: number;
    align?: AlignType;
    direction?: DirectionType;
    indent?: number;
    mentions?: boolean;
    mention?: IMention;
    target?: string;
}
declare class OpAttributeSanitizer {
    static sanitize(dirtyAttrs: IOpAttributes): IOpAttributes;
    static IsValidHexColor(colorStr: string): boolean;
    static IsValidColorLiteral(colorStr: string): boolean;
    static IsValidFontName(fontName: string): boolean;
    static IsValidSize(size: string): boolean;
    static IsValidWidth(width: string): boolean;
    static isValidTarget(target: string): boolean;
}
export { OpAttributeSanitizer, IOpAttributes };
