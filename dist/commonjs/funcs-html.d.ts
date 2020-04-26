interface ITagKeyValue {
  key: string;
  value?: string;
}
declare function makeStartTag(
  tag: any,
  attrs?: ITagKeyValue | ITagKeyValue[] | undefined
): string;
declare function makeEndTag(tag?: any): string;
declare function decodeHtml(str: string): string;
declare function encodeHtml(
  str: string,
  preventDoubleEncoding?: boolean
): string;
declare function encodeLink(str: string): string;
export {
  makeStartTag,
  makeEndTag,
  encodeHtml,
  decodeHtml,
  encodeLink,
  ITagKeyValue,
};
