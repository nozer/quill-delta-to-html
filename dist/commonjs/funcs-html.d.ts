interface ITagKeyValue {
    key: string;
    value?: string;
}
interface IEncodeMapExtension {
    key: string;
    url: boolean;
    html: boolean;
    encodeTo: string;
    encodeMatch: string;
    decodeTo: string;
    decodeMatch: string;
}
declare function makeStartTag(tag: any, attrs?: ITagKeyValue | ITagKeyValue[] | undefined): string;
declare function makeEndTag(tag?: any): string;
declare function decodeHtml(str: string, encodeMapExtensions?: IEncodeMapExtension[]): string;
declare function encodeHtml(str: string, preventDoubleEncoding?: boolean, encodeMapExtensions?: IEncodeMapExtension[]): string;
declare function encodeLink(str: string, encodeMapExtensions?: IEncodeMapExtension[]): string;
export { makeStartTag, makeEndTag, encodeHtml, decodeHtml, encodeLink, ITagKeyValue, IEncodeMapExtension };
