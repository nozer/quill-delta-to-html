
interface ITagKeyValue {
    key: string,
    value?: string
}

enum EncodeTarget {
    Html = 0,
    Url = 1
}

function makeStartTag(tag:any, attrs: ITagKeyValue | ITagKeyValue[] | undefined = undefined ) {
    if (!tag) {return ''; }
    

    var attrsStr = '';
    if (attrs) {
        var arrAttrs = ([] as ITagKeyValue[]).concat(attrs);
        attrsStr = arrAttrs.map(function(attr:any){
            return attr.key + (attr.value ? '="' + attr.value + '"' : '');
        }).join(' ');
    }

    var closing = '>';
    if (tag === 'img' || tag === 'br') {
        closing = '/>';
    }
    return attrsStr ? `<${tag} ${attrsStr}${closing}` : `<${tag}${closing}`;
}

function makeEndTag(tag: any = '') {
    return tag && `</${tag}>` || '';
}

function decodeHtml(str: string) {
    return encodeMappings(EncodeTarget.Html).reduce(decodeMapping, str);
}

function encodeHtml(str: string, preventDoubleEncoding = true) {
    if (preventDoubleEncoding) {
        str = decodeHtml(str);
    }
    return encodeMappings(EncodeTarget.Html).reduce(encodeMapping, str);
}

function encodeLink(str: string) {
    let linkMaps = encodeMappings(EncodeTarget.Url);
    let decoded = linkMaps.reduce(decodeMapping, str);
    return linkMaps.reduce(encodeMapping, decoded);
}

function encodeMappings(mtype: EncodeTarget) {
    let maps = [
        {
            url: true,
            html: true,
            encodeTo: '&amp;',
            encodeMatch: '&amp;',
            decodeTo: '&',
            decodeMatch: '&'
        },
        {
            url: true,
            html: true,
            encodeTo: '&lt;$1',
            encodeMatch: '&lt;',
            decodeTo: '<',
            decodeMatch: '<([^%])'
        },
        {
            url: true,
            html: true,
            encodeTo: '$1&gt;',
            encodeMatch: '&gt;',
            decodeTo: '>',
            decodeMatch: '([^%])>'
        },
        {
            url: true,
            html: true,
            encodeTo: '&quot;',
            encodeMatch: '&quot;',
            decodeTo: '"',
            decodeMatch: '"'
        },
        {
            url: true,
            html: true,
            encodeTo: '&#x27;',
            encodeMatch: '&#x27;',
            decodeTo: "'",
            decodeMatch: "'"
        },
        {
            url: false,
            html: true,
            encodeTo: '&#x2F;',
            encodeMatch: '&#x2F;',
            decodeTo: '/',
            decodeMatch: '/'
        },
        {
            url: true,
            html: false,
            encodeTo: '&#40;',
            encodeMatch: '&#40;',
            decodeTo: '(',
            decodeMatch: '\\('
        },
        {  
            url: true,
            html: false,
            encodeTo: '&#41;',
            encodeMatch: '&#41;',
            decodeTo: ')',
            decodeMatch: '\\)'
        }
    ];

    if (mtype === EncodeTarget.Html) {
        return maps.filter(({html}) =>  html);
    } else { // for url
        return maps.filter(({url}) =>  url);
    }
}
function encodeMapping(str: string, mapping: { decodeMatch: string, encodeTo: string }) {
    return str.replace(new RegExp(mapping.decodeMatch, 'g'), mapping.encodeTo);
}
function decodeMapping(str: string, mapping: { encodeMatch: string, decodeTo: string }) {
    return str.replace(new RegExp(mapping.encodeMatch, 'g'), mapping.decodeTo);
}
export {
    makeStartTag,
    makeEndTag,
    encodeHtml,
    decodeHtml,
    encodeLink,
    ITagKeyValue
};
