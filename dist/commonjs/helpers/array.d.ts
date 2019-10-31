interface IArraySlice<T> {
    sliceStartsAt: number;
    elements: T[];
}
declare function preferSecond(arr: any[]): any;
declare function flatten(arr: any[]): any[];
declare function groupConsecutiveElementsWhile(arr: any[], predicate: (currElm: any, prevElm: any) => boolean): any[];
declare function sliceFromReverseWhile<T>(arr: T[], startIndex: number, predicate: (currElm: T) => boolean): IArraySlice<T>;
declare function intersperse(arr: any[], item: any): any[];
declare function partitionAtIndexes<T>(arr: T[], indexes: number[]): T[][];
export { IArraySlice, preferSecond, flatten, groupConsecutiveElementsWhile, sliceFromReverseWhile, intersperse, partitionAtIndexes };
