import { TDataGroup } from './group-types';
declare class ListNester {
    nest(groups: TDataGroup[]): TDataGroup[];
    private convertListBlocksToListGroups;
    private groupConsecutiveListGroups;
    private nestListSection;
    private groupByIndent;
    private placeUnderParent;
}
export { ListNester };
