interface IArraySlice {
    sliceStartsAt: number;
    elements: any[];
}
interface Array<T> {
    _preferSecond(): T | null;
    _flatten(): any[];
    _groupConsecutiveElementsWhile(predicate: (currElm: any, prevElm: any) => boolean): any[];
    _sliceFromReverseWhile(startIndex: number, predicate: (currElm: any) => boolean): IArraySlice;
    _intersperse(item: any): any[];
}
