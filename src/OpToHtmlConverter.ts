
import { makeStartTag, makeEndTag, encodeHtml } from './funcs-html';
import { Embed, EmbedType } from './Embed';
import { DeltaInsertOp } from './DeltaInsertOp';
import { ScriptType } from './value-types';
import { preferSecond, scrubUrl } from './funcs-misc';
import { IOpAttributes } from './IOpAttributes';

interface IOpToHtmlConverterOptions {
    classPrefix?: string,
    encodeHtml?: boolean
}

class OpToHtmlConverter {

    private op: DeltaInsertOp;
    private options: IOpToHtmlConverterOptions;

    // Saved for fast lookup in multiple calls 
    private _cssClasses: null | string[] = null;
    private _cssStyles: null | string[] = null;

    constructor(op: DeltaInsertOp, options?: IOpToHtmlConverterOptions) {
        this.op = op;
        this.options = Object.assign({}, { 
            classPrefix: 'ql',
            encodeHtml: true
        }, options);
    }

    prefixClass(className: any): string {
        if (!this.options.classPrefix) {
            return className + '';
        }
        return this.options.classPrefix + '-' + className;
    }

    getHtml(): string {
        var parts = this.getHtmlParts();
        return parts.opening + parts.content + parts.closing;
    }

    getHtmlParts(): { opening: string, closing: string, content: string } {
        if (this.op.isNewLine() && !this.op.isContainerBlock()) {
            return { opening: '<br />', closing: '', content: '' };
        }

        let tags = this.getTags(), attrs = this.getTagAttributes();
        
        let beginTags = [], endTags = [];

        var isAttrsConsumed = false;
        for (var tag of tags) {
            beginTags.push(makeStartTag(tag, !isAttrsConsumed && attrs || null));
            endTags.push(tag === 'img' ? '' : makeEndTag(tag));
            isAttrsConsumed = true;
        }
        endTags.reverse();

        return {
            opening: beginTags.join(''),
            content: this.getContent(),
            closing: endTags.join('')
        };
    }

    getContent(): string {
        if (this.op.isContainerBlock()) {
            return '';
        }
        var content = '';
        if (this.op.isFormula()) {
            content = (<Embed>this.op.insert).value;
        } else if (this.op.isText()) {
            content = <string>this.op.insert;
        } 
        return this.options.encodeHtml && encodeHtml(content) || content;
    }

    getCssClasses(): string[] {
        if (this._cssClasses !== null) {
            return this._cssClasses;
        }
        var attrs: any = this.op.attributes;

        type Str2StrType = { (x: string): string };

        return this._cssClasses = ['indent', 'align', 'direction', 'font', 'size']
            .filter((prop) => !!attrs[prop])
            .map((prop) => prop + '-' + attrs[prop])
            .concat(this.op.isFormula() ? 'formula' : [])
            .concat(this.op.isVideo() ? 'video' : [])
            .concat(this.op.isImage() ? 'image' : [])
            .map(<Str2StrType>this.prefixClass.bind(this));
    }


    getCssStyles() {
        if (this._cssStyles !== null) {
            return this._cssStyles;
        }
        
        var attrs: any = this.op.attributes;

        return this._cssStyles = [['background', 'background-color'], ['color']]
            .filter((item) => !!attrs[item[0]])
            .map((item) => preferSecond(item) + ':' + attrs[item[0]]);
    }

    getTagAttributes(): any[] {
        if (this.op.attributes.code) {
            return [];
        }

        const makeAttr = (k: string, v: any) => ({ key: k, value: v });

        var classes = this.getCssClasses();
        var tagAttrs = classes.length ? [makeAttr('class', classes.join(' '))] : [];

        if (this.op.isImage()) {
            let src = scrubUrl((<Embed>this.op.insert).value);
            return tagAttrs.concat(makeAttr('src', src));
        }

        if (this.op.isFormula() || this.op.isContainerBlock()) {
            return tagAttrs;
        }

        if (this.op.isVideo()) {
            let src = scrubUrl((<Embed>this.op.insert).value);
            return tagAttrs.concat(
                makeAttr('frameborder', '0'),
                makeAttr('allowfullscreen', 'true'),
                makeAttr('src', src)
            );
        }

        var styles = this.getCssStyles();
        var styleAttr = styles.length ? [makeAttr('style', styles.join(';'))] : [];

        return tagAttrs
            .concat(styleAttr)
            .concat(this.op.isLink() ? makeAttr('href', this.op.attributes.link) : []);
    }

    getTags(): string[] {
        var attrs: any = this.op.attributes;

        // code 
        if (attrs.code) {
            return ['code'];
        }

        // embeds
        if (this.op.isEmbed()) {
            return [this.op.isVideo() ? 'iframe'
                : this.op.isImage() ? 'img'
                    : this.op.isFormula() ? 'span'
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
        var inlineTags = [['link', 'a'], ['script'],
        ['bold', 'strong'], ['italic', 'em'], ['strike', 's'], ['underline', 'u']
        ]
            .filter((item: any[]) => !!attrs[item[0]])
            .map((item) => {
                return item[0] === 'script' ?
                    (attrs[item[0]] === ScriptType.Sub ? 'sub' : 'sup')
                    : preferSecond(item);
            });
        if (!inlineTags.length && 
            (this.getCssStyles().length || this.getCssClasses().length)){
            return ['span'];
        }
        return inlineTags;
    }


}

export { OpToHtmlConverter, IOpToHtmlConverterOptions };