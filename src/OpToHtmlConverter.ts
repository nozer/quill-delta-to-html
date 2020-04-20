import {
  makeStartTag,
  makeEndTag,
  encodeHtml,
  ITagKeyValue,
} from './funcs-html';
import { DeltaInsertOp } from './DeltaInsertOp';
import { ScriptType, NewLine } from './value-types';
import * as obj from './helpers/object';
import { IMention } from './mentions/MentionSanitizer';
import * as arr from './helpers/array';
import { OpAttributeSanitizer } from './OpAttributeSanitizer';

export type InlineStyleType =
  | ((value: string, op: DeltaInsertOp) => string | undefined)
  | { [x: string]: string };

export interface IInlineStyles {
  indent?: InlineStyleType;
  align?: InlineStyleType;
  direction?: InlineStyleType;
  font?: InlineStyleType;
  size?: InlineStyleType;
}

const DEFAULT_INLINE_FONTS: { [key: string]: string } = {
  serif: 'font-family: Georgia, Times New Roman, serif',
  monospace: 'font-family: Monaco, Courier New, monospace',
};

export const DEFAULT_INLINE_STYLES: IInlineStyles = {
  font: (value) => DEFAULT_INLINE_FONTS[value] || 'font-family:' + value,
  size: {
    small: 'font-size: 0.75em',
    large: 'font-size: 1.5em',
    huge: 'font-size: 2.5em',
  },
  indent: (value, op) => {
    var indentSize = parseInt(value, 10) * 3;
    var side = op.attributes['direction'] === 'rtl' ? 'right' : 'left';
    return 'padding-' + side + ':' + indentSize + 'em';
  },
  direction: (value, op) => {
    if (value === 'rtl') {
      return (
        'direction:rtl' + (op.attributes['align'] ? '' : '; text-align:inherit')
      );
    } else {
      return undefined;
    }
  },
};

interface IOpToHtmlConverterOptions {
  classPrefix?: string;
  inlineStyles?: boolean | IInlineStyles;
  encodeHtml?: boolean;
  listItemTag?: string;
  paragraphTag?: string;
  linkRel?: string;
  linkTarget?: string;
  allowBackgroundClasses?: boolean;
  customTag?: (format: string, op: DeltaInsertOp) => string | void;
  customTagAttributes?: (op: DeltaInsertOp) => { [key: string]: string } | void;
  customCssClasses?: (op: DeltaInsertOp) => string | string[] | void;
  customCssStyles?: (op: DeltaInsertOp) => string | string[] | void;
}

interface IHtmlParts {
  openingTag: string;
  content: string;
  closingTag: string;
}

class OpToHtmlConverter {
  private options: IOpToHtmlConverterOptions;
  private op: DeltaInsertOp;

  constructor(op: DeltaInsertOp, options?: IOpToHtmlConverterOptions) {
    this.op = op;
    this.options = obj.assign(
      {},
      {
        classPrefix: 'ql',
        inlineStyles: undefined,
        encodeHtml: true,
        listItemTag: 'li',
        paragraphTag: 'p',
      },
      options
    );
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
      return { openingTag: '', closingTag: '', content: NewLine };
    }

    let tags = this.getTags(),
      attrs = this.getTagAttributes();

    if (!tags.length && attrs.length) {
      tags.push('span');
    }

    let beginTags = [],
      endTags = [];
    const imgTag = 'img';
    const isImageLink = (tag: any) =>
      tag === imgTag && !!this.op.attributes.link;
    for (var tag of tags) {
      if (isImageLink(tag)) {
        beginTags.push(makeStartTag('a', this.getLinkAttrs()));
      }
      beginTags.push(makeStartTag(tag, attrs));
      endTags.push(tag === 'img' ? '' : makeEndTag(tag));
      if (isImageLink(tag)) {
        endTags.push(makeEndTag('a'));
      }
      // consumed in first tag
      attrs = [];
    }
    endTags.reverse();

    return {
      openingTag: beginTags.join(''),
      content: this.getContent(),
      closingTag: endTags.join(''),
    };
  }

  getContent(): string {
    if (this.op.isContainerBlock()) {
      return '';
    }

    if (this.op.isMentions()) {
      return this.op.insert.value;
    }

    var content =
      this.op.isFormula() || this.op.isText() ? this.op.insert.value : '';

    return (this.options.encodeHtml && encodeHtml(content)) || content;
  }

  getCssClasses(): string[] {
    var attrs: any = this.op.attributes;

    type Str2StrType = { (x: string): string };

    if (this.options.inlineStyles) {
      return [];
    }

    var propsArr = ['indent', 'align', 'direction', 'font', 'size'];
    if (this.options.allowBackgroundClasses) {
      propsArr.push('background');
    }
    return (this.getCustomCssClasses() || []).concat(
      propsArr
        .filter((prop) => !!attrs[prop])
        .filter((prop) =>
          prop === 'background'
            ? OpAttributeSanitizer.IsValidColorLiteral(attrs[prop])
            : true
        )
        .map((prop) => prop + '-' + attrs[prop])
        .concat(this.op.isFormula() ? 'formula' : [])
        .concat(this.op.isVideo() ? 'video' : [])
        .concat(this.op.isImage() ? 'image' : [])
        .map(<Str2StrType>this.prefixClass.bind(this))
    );
  }

  getCssStyles(): string[] {
    var attrs: any = this.op.attributes;

    var propsArr = [['color']];
    if (!!this.options.inlineStyles || !this.options.allowBackgroundClasses) {
      propsArr.push(['background', 'background-color']);
    }
    if (this.options.inlineStyles) {
      propsArr = propsArr.concat([
        ['indent'],
        ['align', 'text-align'],
        ['direction'],
        ['font', 'font-family'],
        ['size'],
      ]);
    }

    return (this.getCustomCssStyles() || [])
      .concat(
        propsArr
          .filter((item) => !!attrs[item[0]])
          .map((item: any[]) => {
            let attribute = item[0];
            let attrValue = attrs[attribute];

            let attributeConverter: InlineStyleType =
              (this.options.inlineStyles &&
                (this.options.inlineStyles as any)[attribute]) ||
              (DEFAULT_INLINE_STYLES as any)[attribute];

            if (typeof attributeConverter === 'object') {
              return attributeConverter[attrValue];
            } else if (typeof attributeConverter === 'function') {
              var converterFn = attributeConverter as (
                value: string,
                op: DeltaInsertOp
              ) => string;
              return converterFn(attrValue, this.op);
            } else {
              return arr.preferSecond(item) + ':' + attrValue;
            }
          })
      )
      .filter((item: any) => item !== undefined);
  }

  getTagAttributes(): Array<ITagKeyValue> {
    if (this.op.attributes.code && !this.op.isLink()) {
      return [];
    }

    const makeAttr = this.makeAttr.bind(this);
    const customTagAttributes = this.getCustomTagAttributes();
    const customAttr = customTagAttributes
      ? Object.keys(this.getCustomTagAttributes()).map((k) =>
          makeAttr(k, customTagAttributes[k])
        )
      : [];
    var classes = this.getCssClasses();
    var tagAttrs = classes.length
      ? customAttr.concat([makeAttr('class', classes.join(' '))])
      : customAttr;

    if (this.op.isImage()) {
      this.op.attributes.width &&
        (tagAttrs = tagAttrs.concat(
          makeAttr('width', this.op.attributes.width)
        ));
      return tagAttrs.concat(makeAttr('src', this.op.insert.value));
    }

    if (this.op.isACheckList()) {
      return tagAttrs.concat(
        makeAttr('data-checked', this.op.isCheckedList() ? 'true' : 'false')
      );
    }

    if (this.op.isFormula()) {
      return tagAttrs;
    }

    if (this.op.isVideo()) {
      return tagAttrs.concat(
        makeAttr('frameborder', '0'),
        makeAttr('allowfullscreen', 'true'),
        makeAttr('src', this.op.insert.value)
      );
    }

    if (this.op.isMentions()) {
      var mention: IMention = this.op.attributes.mention!;
      if (mention.class) {
        tagAttrs = tagAttrs.concat(makeAttr('class', mention.class));
      }
      if (mention['end-point'] && mention.slug) {
        tagAttrs = tagAttrs.concat(
          makeAttr('href', mention['end-point'] + '/' + mention.slug)
        );
      } else {
        tagAttrs = tagAttrs.concat(makeAttr('href', 'about:blank'));
      }
      if (mention.target) {
        tagAttrs = tagAttrs.concat(makeAttr('target', mention.target));
      }
      return tagAttrs;
    }

    var styles = this.getCssStyles();
    if (styles.length) {
      tagAttrs.push(makeAttr('style', styles.join(';')));
    }

    if (
      this.op.isCodeBlock() &&
      typeof this.op.attributes['code-block'] === 'string'
    ) {
      return tagAttrs.concat(
        makeAttr('data-language', this.op.attributes['code-block'])
      );
    }

    if (this.op.isContainerBlock()) {
      return tagAttrs;
    }

    if (this.op.isLink()) {
      tagAttrs = tagAttrs.concat(this.getLinkAttrs());
    }

    return tagAttrs;
  }

  makeAttr(k: string, v: string): ITagKeyValue {
    return { key: k, value: v };
  }

  getLinkAttrs(): Array<ITagKeyValue> {
    let tagAttrs: ITagKeyValue[] = [];

    let targetForAll = OpAttributeSanitizer.isValidTarget(
      this.options.linkTarget || ''
    )
      ? this.options.linkTarget
      : undefined;
    let relForAll = OpAttributeSanitizer.IsValidRel(this.options.linkRel || '')
      ? this.options.linkRel
      : undefined;

    let target = this.op.attributes.target || targetForAll;
    let rel = this.op.attributes.rel || relForAll;

    return tagAttrs
      .concat(this.makeAttr('href', this.op.attributes.link!))
      .concat(target ? this.makeAttr('target', target) : [])
      .concat(rel ? this.makeAttr('rel', rel) : []);
  }

  getCustomTag(format: string) {
    if (
      this.options.customTag &&
      typeof this.options.customTag === 'function'
    ) {
      return this.options.customTag.apply(null, [format, this.op]);
    }
  }

  getCustomTagAttributes() {
    if (
      this.options.customTagAttributes &&
      typeof this.options.customTagAttributes === 'function'
    ) {
      return this.options.customTagAttributes.apply(null, [this.op]);
    }
  }

  getCustomCssClasses() {
    if (
      this.options.customCssClasses &&
      typeof this.options.customCssClasses === 'function'
    ) {
      const res = this.options.customCssClasses.apply(null, [this.op]);
      if (res) {
        return Array.isArray(res) ? res : [res];
      }
    }
  }

  getCustomCssStyles() {
    if (
      this.options.customCssStyles &&
      typeof this.options.customCssStyles === 'function'
    ) {
      const res = this.options.customCssStyles.apply(null, [this.op]);
      if (res) {
        return Array.isArray(res) ? res : [res];
      }
    }
  }

  getTags(): string[] {
    var attrs: any = this.op.attributes;

    // embeds
    if (!this.op.isText()) {
      return [
        this.op.isVideo() ? 'iframe' : this.op.isImage() ? 'img' : 'span', // formula
      ];
    }

    // blocks
    var positionTag = this.options.paragraphTag || 'p';

    var blocks = [
      ['blockquote'],
      ['code-block', 'pre'],
      ['list', this.options.listItemTag],
      ['header'],
      ['align', positionTag],
      ['direction', positionTag],
      ['indent', positionTag],
    ];
    for (var item of blocks) {
      var firstItem = item[0]!;
      if (attrs[firstItem]) {
        const customTag = this.getCustomTag(firstItem);
        return customTag
          ? [customTag]
          : firstItem === 'header'
          ? ['h' + attrs[firstItem]]
          : [arr.preferSecond(item)!];
      }
    }

    if (this.op.isCustomTextBlock()) {
      const customTag = this.getCustomTag('renderAsBlock');
      return customTag ? [customTag] : [positionTag];
    }

    // inlines
    const customTagsMap = Object.keys(attrs).reduce((res, it) => {
      const customTag = this.getCustomTag(it);
      if (customTag) {
        res[it] = customTag;
      }
      return res;
    }, {} as any);

    const inlineTags = [
      ['link', 'a'],
      ['mentions', 'a'],
      ['script'],
      ['bold', 'strong'],
      ['italic', 'em'],
      ['strike', 's'],
      ['underline', 'u'],
      ['code'],
    ];

    return [
      ...inlineTags.filter((item: string[]) => !!attrs[item[0]]),
      ...Object.keys(customTagsMap)
        .filter((t) => !inlineTags.some((it) => it[0] == t))
        .map((t) => [t, customTagsMap[t]]),
    ].map((item) => {
      return customTagsMap[item[0]]
        ? customTagsMap[item[0]]
        : item[0] === 'script'
        ? attrs[item[0]] === ScriptType.Sub
          ? 'sub'
          : 'sup'
        : arr.preferSecond(item)!;
    });
  }
}

export { OpToHtmlConverter, IOpToHtmlConverterOptions, IHtmlParts };
