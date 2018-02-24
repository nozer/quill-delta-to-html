import {makeStartTag, makeEndTag, encodeHtml, encodeLink, ITagKeyValue} from './funcs-html';
import {DeltaInsertOp} from './DeltaInsertOp';
import {ScriptType, NewLine} from './value-types';
import './extensions/String';
import './extensions/Object';
import {IMention} from "./mentions/MentionSanitizer";
import './extensions/Array';
import {OpAttributeSanitizer, IOpAttributes} from "./OpAttributeSanitizer";


interface IOpToHtmlConverterOptions {
    classPrefix?: string,
    encodeHtml?: boolean,
    listItemTag?: string,
    paragraphTag?: string,
    linkRel?: string,
    allowBackgroundClasses?: boolean
}

interface IHtmlParts {
    openingTag: string,
    content: string,
    closingTag: string,
}

class OpToHtmlConverter {

    private options: IOpToHtmlConverterOptions;
    private op: DeltaInsertOp;

    constructor(op: DeltaInsertOp, options?: IOpToHtmlConverterOptions) {
        this.op = op;
        this.options = Object._assign({}, {
            classPrefix: 'ql',
            encodeHtml: true,
            listItemTag: 'li',
            paragraphTag: 'p'
        }, options);
    }

    prefixClass(className: string): string {
        if (!this.options.classPrefix) {
            return className + '';
        }
        return this.options.classPrefix + '-' + className;
    }

    getHtml(): string {
        var parts = this.getHtmlParts();
        return parts.openingTag + parts.content + parts.closingTag;
    }

    getHtmlParts(): IHtmlParts {
        
        if (this.op.isJustNewline() && !this.op.isContainerBlock()) {
            return {openingTag: '', closingTag: '', content: NewLine};
        }

        let tags = this.getTags(), attrs = this.getTagAttributes();

        if (!tags.length && attrs.length) {
            tags.push('span');
        }

        let beginTags = [], endTags = [];

        for (var tag of tags) {
            beginTags.push(makeStartTag(tag, attrs));
            endTags.push(tag === 'img' ? '' : makeEndTag(tag));
            // consumed in first tag
            attrs = null;
        }
        endTags.reverse();

        return {
            openingTag: beginTags.join(''),
            content: this.getContent(),
            closingTag: endTags.join('')
        };
    }

    getContent(): string {
        if (this.op.isContainerBlock()) {
            return '';
        }

        if (this.op.isMentions()) {
            return this.op.insert.value;
        }

        var content = this.op.isFormula() || this.op.isText() ? this.op.insert.value : '';

        return this.options.encodeHtml && encodeHtml(content) || content;
    }

    getCssClasses(): string[] {

        var attrs: any = this.op.attributes;

        type Str2StrType = { (x: string): string };

        var propsArr = ['indent', 'align', 'direction', 'font', 'size'];
        if (this.options.allowBackgroundClasses) {
            propsArr.push('background');
        }
        return propsArr
            .filter((prop) => !!attrs[prop])
            .filter((prop) => prop === 'background' ? OpAttributeSanitizer.IsValidColorLiteral(attrs[prop]) : true)
            .map((prop) => prop + '-' + attrs[prop])
            .concat(this.op.isFormula() ? 'formula' : [])
            .concat(this.op.isVideo() ? 'video' : [])
            .concat(this.op.isImage() ? 'image' : [])
            .map(<Str2StrType>this.prefixClass.bind(this));
    }


    getCssStyles(): string[] {

        var attrs: any = this.op.attributes;

        var propsArr = [['color']];
        if (!this.options.allowBackgroundClasses) {
            propsArr.push(['background', 'background-color']);
        }
        return propsArr
            .filter((item) => !!attrs[item[0]])
            .map((item: any[]) => item._preferSecond() + ':' + attrs[item[0]]);
    }

    getTagAttributes(): Array<ITagKeyValue> {
        if (this.op.attributes.code) {
            return [];
        }

        const makeAttr = (k: string, v: string): ITagKeyValue => ({key: k, value: v});

        var classes = this.getCssClasses();
        var tagAttrs = classes.length ? [makeAttr('class', classes.join(' '))] : [];

        if (this.op.isImage()) {
            this.op.attributes.width && (tagAttrs = tagAttrs.concat(makeAttr('width', this.op.attributes.width)));
            return tagAttrs.concat(makeAttr('src', (this.op.insert.value + '')._scrubUrl()));
        }

        if (this.op.isFormula() || this.op.isContainerBlock()) {
            return tagAttrs;
        }

        if (this.op.isVideo()) {
            return tagAttrs.concat(
                makeAttr('frameborder', '0'),
                makeAttr('allowfullscreen', 'true'),
                makeAttr('src', (this.op.insert.value + '')._scrubUrl())
            );
        }

        if (this.op.isMentions()) {
            var mention: IMention = this.op.attributes.mention;
            if (mention.class) {
                tagAttrs = tagAttrs.concat(makeAttr('class', mention.class));
            }
            if (mention['end-point'] && mention.slug) {
                tagAttrs = tagAttrs.concat(
                    makeAttr('href', encodeLink(mention['end-point'] + '/' + mention.slug))
                );
            } else {
                tagAttrs  = tagAttrs.concat(makeAttr('href', 'javascript:void(0)'));
            }
            if (mention.target) {
                tagAttrs = tagAttrs.concat(makeAttr('target', mention.target));
            }
            return tagAttrs;
        }

        var styles = this.getCssStyles();
        var styleAttr = styles.length ? [makeAttr('style', styles.join(';'))] : [];

        tagAttrs = tagAttrs
            .concat(styleAttr)
            .concat(this.op.isLink() ? [
                makeAttr('href', encodeLink(this.op.attributes.link)),
                makeAttr('target', '_blank')
            ] : []);

        if (this.op.isLink() && !!this.options.linkRel && OpToHtmlConverter.IsValidRel(this.options.linkRel)) {
            tagAttrs.push(makeAttr('rel', this.options.linkRel));
        }

        return tagAttrs;
    }

    getTags(): string[] {
        var attrs: any = this.op.attributes;

        // code
        if (attrs.code) {
            return ['code'];
        }

        // embeds
        if (!this.op.isText()) {
            return [this.op.isVideo() ? 'iframe'
                : this.op.isImage() ? 'img'
                    : 'span' // formula
            ]
        }

        // blocks
        var positionTag = this.options.paragraphTag || 'p';

        var blocks = [['blockquote'], ['code-block', 'pre'],
            ['list', this.options.listItemTag], ['header'],
            ['align', positionTag], ['direction', positionTag],
            ['indent', positionTag]];
        for (var item of blocks) {
            if (attrs[item[0]]) {
                return item[0] === 'header' ? ['h' + attrs[item[0]]] : [item._preferSecond()];
            }
        }

        // inlines
        return [['link', 'a'], ['script'],
            ['bold', 'strong'], ['italic', 'em'], ['strike', 's'], ['underline', 'u'],
            ['mentions', 'a']]
            .filter((item: any[]) => !!attrs[item[0]])
            .map((item) => {
                return item[0] === 'script' ?
                    (attrs[item[0]] === ScriptType.Sub ? 'sub' : 'sup')
                    : item._preferSecond();
            });
    }

    static IsValidRel(relStr: string) {
        return !!relStr.match(/^[a-z\s]{1,50}$/i);
    }

}

export {OpToHtmlConverter, IOpToHtmlConverterOptions, IHtmlParts};
