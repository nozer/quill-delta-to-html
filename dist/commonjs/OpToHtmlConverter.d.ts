import { ITagKeyValue } from './funcs-html';
import { DeltaInsertOp } from './DeltaInsertOp';
interface IOpToHtmlConverterOptions {
    classPrefix?: string;
    encodeHtml?: boolean;
    listItemTag?: string;
    paragraphTag?: string;
    linkRel?: string;
    linkTarget?: string;
    allowBackgroundClasses?: boolean;
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
