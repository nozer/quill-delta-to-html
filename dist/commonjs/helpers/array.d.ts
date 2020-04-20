interface IArraySlice {
  sliceStartsAt: number;
  elements: any[];
}
declare function preferSecond(arr: any[]): any;
declare function flatten(arr: any[]): any[];
declare function find(arr: any[], predicate: (currElm: any) => boolean): any;
declare function groupConsecutiveElementsWhile(
  arr: any[],
  predicate: (currElm: any, prevElm: any) => boolean
): any[];
declare function sliceFromReverseWhile(
  arr: any[],
  startIndex: number,
  predicate: (currElm: any) => boolean
): IArraySlice;
declare function intersperse(arr: any[], item: any): any[];
export {
  IArraySlice,
  preferSecond,
  flatten,
  groupConsecutiveElementsWhile,
  sliceFromReverseWhile,
  intersperse,
  find,
};
