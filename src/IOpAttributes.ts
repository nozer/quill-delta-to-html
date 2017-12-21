
import { ListType, AlignType, DirectionType, ScriptType, MentionType } from './value-types';

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
    mention?: MentionType
}

export { IOpAttributes };