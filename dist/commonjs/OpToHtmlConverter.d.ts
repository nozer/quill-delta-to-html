import { ITagKeyValue, IEncodeMapExtension } from './funcs-html';
import { DeltaInsertOp } from './DeltaInsertOp';
export declare type InlineStyleType = ((value: string, op: DeltaInsertOp) => string | undefined) | {
    [x: string]: string;
};
export interface IInlineStyles {
    indent?: InlineStyleType;
    align?: InlineStyleType;
    direction?: InlineStyleType;
    font?: InlineStyleType;
    size?: InlineStyleType;
}
export declare const DEFAULT_INLINE_STYLES: IInlineStyles;
interface IOpToHtmlConverterOptions {
    classPrefix?: string;
    inlineStyles?: IInlineStyles;
    encodeHtml?: boolean;
    listItemTag?: string;
    paragraphTag?: string;
    linkRel?: string;
    linkTarget?: string;
    allowBackgroundClasses?: boolean;
    encodeMapExtensions?: IEncodeMapExtension[];
    urlWhiteListExtensions?: string[];
}
interface IHtmlParts {
    openingTag: string;
    content: string;
    closingTag: string;
}
declare class OpToHtmlConverter {
    private options;
    private op;
    constructor(op: DeltaInsertOp, options?: IOpToHtmlConverterOptions);
    prefixClass(className: string): string;
    getHtml(): string;
    getHtmlParts(): IHtmlParts;
    getContent(): string;
    getCssClasses(): string[];
    getCssStyles(): string[];
    getTagAttributes(): Array<ITagKeyValue>;
    getTags(): string[];
    static IsValidRel(relStr: string): boolean;
}
export { OpToHtmlConverter, IOpToHtmlConverterOptions, IHtmlParts };
