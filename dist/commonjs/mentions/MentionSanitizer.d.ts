import { IOpAttributeSanitizerOptions } from './../OpAttributeSanitizer';
interface IMention {
    [index: string]: string | undefined;
    name?: string;
    target?: string;
    slug?: string;
    class?: string;
    avatar?: string;
    id?: string;
    'end-point'?: string;
}
declare class MentionSanitizer {
    static sanitize(dirtyObj: IMention, sanitizeOptions: IOpAttributeSanitizerOptions): IMention;
    static IsValidClass(classAttr: string): boolean;
    static IsValidId(idAttr: string): boolean;
    static IsValidTarget(target: string): boolean;
}
export { MentionSanitizer, IMention };
