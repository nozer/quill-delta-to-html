interface ITagKeyValue {
    key: string;
    value?: string;
}
declare function makeStartTag(tag: any, attrs?: ITagKeyValue | ITagKeyValue[] | undefined): string;
declare function makeEndTag(tag?: any): string;
declare function decodeHtml(str: string, encodeMapExtensions?: {
    key: string;
    url: boolean;
    html: boolean;
    encodeTo: string;
    encodeMatch: string;
    decodeTo: string;
    decodeMatch: string;
}[]): string;
declare function encodeHtml(str: string, preventDoubleEncoding?: boolean, encodeMapExtensions?: {
    key: string;
    url: boolean;
    html: boolean;
    encodeTo: string;
    encodeMatch: string;
    decodeTo: string;
    decodeMatch: string;
}[]): string;
declare function encodeLink(str: string, encodeMapExtensions?: {
    key: string;
    url: boolean;
    html: boolean;
    encodeTo: string;
    encodeMatch: string;
    decodeTo: string;
    decodeMatch: string;
}[]): string;
export { makeStartTag, makeEndTag, encodeHtml, decodeHtml, encodeLink, ITagKeyValue };
