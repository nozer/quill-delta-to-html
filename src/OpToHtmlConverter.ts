
import { makeStartTag, makeEndTag, encodeHtml } from './funcs-html';
import { Embed, EmbedType } from './Embed';
import { DeltaInsertOp } from './DeltaInsertOp';
import { ScriptType } from './value-types';
import { preferSecond, scrubUrl } from './funcs-misc';
import { IOpAttributes } from './IOpAttributes';

interface IOpToHtmlConverterOptions {
    classPrefix?: string,
    encodeHtml?: boolean,
    paragraphTag?: string,
    styledTextTag?: string
}

interface ITagKeyValue {
    key: string,
    value: string
}

class OpToHtmlConverter {

    private options: IOpToHtmlConverterOptions;

    constructor(options?: IOpToHtmlConverterOptions) {
        options = Object.assign({}, { 
            classPrefix: 'ql',
            encodeHtml: true,
            paragraphTag: 'p',
            styledTextTag: 'span'
        }, options);
    }

    prefixClass(className: string): string {
        if (!this.options.classPrefix) {
            return className + '';
        }
        return this.options.classPrefix + '-' + className;
    }

    getHtml(op: DeltaInsertOp): string {
        var parts = this.getHtmlParts(op);
        return parts.openingTag + parts.content + parts.closingTag;
    }

    getHtmlParts(op: DeltaInsertOp): { openingTag: string, closingTag: string, content: string } {
        
        let tags = this.getTags(op), attrs = this.getTagAttributes(op);
        if (!tags.length && this.options.styledTextTag) {
            if (attrs.some((a) => a.key === 'css' || a.key === 'style')) {
                tags.push(this.options.styledTextTag);
            }
        }
        
        let beginTags = [], endTags = [];

        var isAttrsConsumed = false;
        for (var tag of tags) {
            beginTags.push(makeStartTag(tag, !isAttrsConsumed && attrs || null));
            endTags.push(tag === 'img' ? '' : makeEndTag(tag));
            isAttrsConsumed = true;
        }
        endTags.reverse();

        return {
            openingTag: beginTags.join(''),
            content: this.getContent(op), //.replace(/\n/g, '</p><p>'),
            closingTag: endTags.join('')
        };
    }

    getContent(op: DeltaInsertOp): string {
        if (op.isContainerBlock()) {
            return '';
        }
        var content = '';
        if (op.isFormula()) {
            content = (<Embed>op.insert).value;
        } else if (op.isText()) {
            content = <string>op.insert;
        } 
        return this.options.encodeHtml && encodeHtml(content) || content;
    }

    getCssClasses(op: DeltaInsertOp): string[] {
        
        var attrs: any = op.attributes;

        type Str2StrType = { (x: string): string };

        return ['indent', 'align', 'direction', 'font', 'size']
            .filter((prop) => !!attrs[prop])
            .map((prop) => prop + '-' + attrs[prop])
            .concat(op.isFormula() ? 'formula' : [])
            .concat(op.isVideo() ? 'video' : [])
            .concat(op.isImage() ? 'image' : [])
            .map(<Str2StrType>this.prefixClass.bind(this));
    }


    getCssStyles(op: DeltaInsertOp): string[] {
        
        var attrs: any = op.attributes;

        return [['background', 'background-color'], ['color']]
            .filter((item) => !!attrs[item[0]])
            .map((item) => preferSecond(item) + ':' + attrs[item[0]]);
    }

    getTagAttributes(op: DeltaInsertOp): Array<ITagKeyValue> {
        if (op.attributes.code) {
            return [];
        }

        const makeAttr = (k: string, v: string): ITagKeyValue => ({ key: k, value: v });

        var classes = this.getCssClasses(op);
        var tagAttrs = classes.length ? [makeAttr('class', classes.join(' '))] : [];

        if (op.isImage()) {
            let src = scrubUrl((<Embed>op.insert).value);
            return tagAttrs.concat(makeAttr('src', src));
        }

        if (op.isFormula() || op.isContainerBlock()) {
            return tagAttrs;
        }

        if (op.isVideo()) {
            let src = scrubUrl((<Embed>op.insert).value);
            return tagAttrs.concat(
                makeAttr('frameborder', '0'),
                makeAttr('allowfullscreen', 'true'),
                makeAttr('src', src)
            );
        }

        var styles = this.getCssStyles(op);
        var styleAttr = styles.length ? [makeAttr('style', styles.join(';'))] : [];

        return tagAttrs
            .concat(styleAttr)
            .concat(op.isLink() ? makeAttr('href', op.attributes.link) : []);
    }

    getTags(op: DeltaInsertOp): string[] {
        var attrs: any = op.attributes;

        // code 
        if (attrs.code) {
            return ['code'];
        }

        // embeds
        if (op.isEmbed()) {
            return [op.isVideo() ? 'iframe'
                : op.isImage() ? 'img'
                    : op.isFormula() ? 'span'
                        : 'unknown'
            ]
        }

        // blocks 
        var blocks = [['blockquote'], ['code-block', 'pre'], ['list', 'li'], ['header']];
        for (var item of blocks) {
            if (attrs[item[0]]) {
                return item[0] === 'header' ? ['h' + attrs[item[0]]] : [preferSecond(item)];
            }
        }

        // inlines  
        return [['link', 'a'], ['script'],
        ['bold', 'strong'], ['italic', 'em'], ['strike', 's'], ['underline', 'u']
        ]
            .filter((item: any[]) => !!attrs[item[0]])
            .map((item) => {
                return item[0] === 'script' ?
                    (attrs[item[0]] === ScriptType.Sub ? 'sub' : 'sup')
                    : preferSecond(item);
            });
    }


}

export { OpToHtmlConverter, IOpToHtmlConverterOptions };