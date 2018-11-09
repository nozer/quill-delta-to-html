
interface ITagKeyValue {
    key: string,
    value?: string
}

interface IEncodeMapExtension {
    key: string, 
    url: boolean, 
    html: boolean, 
    encodeTo: string, 
    encodeMatch: string, 
    decodeTo: string, 
    decodeMatch: string
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

function decodeHtml(str: string, encodeMapExtensions?: IEncodeMapExtension[]) {
    return encodeMappings(EncodeTarget.Html, encodeMapExtensions).reduce(decodeMapping, str);
}

function encodeHtml(str: string, preventDoubleEncoding = true, encodeMapExtensions?: IEncodeMapExtension[]) {
    if (preventDoubleEncoding) {
        str = decodeHtml(str, encodeMapExtensions);
    }
    return encodeMappings(EncodeTarget.Html, encodeMapExtensions).reduce(encodeMapping, str);
}

function encodeLink(str: string, encodeMapExtensions?: IEncodeMapExtension[]) {
    let linkMaps = encodeMappings(EncodeTarget.Url, encodeMapExtensions);
    let decoded = linkMaps.reduce(decodeMapping, str);
    return linkMaps.reduce(encodeMapping, decoded);
}

function encodeMappings(mtype: EncodeTarget, encodeMapExtensions?: IEncodeMapExtension[]) {
    let maps = [
        {
            key: '&',
            url: true,
            html: true,
            encodeTo: '&amp;',
            encodeMatch: '&amp;',
            decodeTo: '&',
            decodeMatch: '&'
        },
        {
            key: '<',
            url: true,
            html: true,
            encodeTo: '&lt;',
            encodeMatch: '&lt;',
            decodeTo: '<',
            decodeMatch: '<'
        },
        {
            key: '>',
            url: true,
            html: true,
            encodeTo: '&gt;',
            encodeMatch: '&gt;',
            decodeTo: '>',
            decodeMatch: '>'
        },
        {
            key: '"',
            url: true,
            html: true,
            encodeTo: '&quot;',
            encodeMatch: '&quot;',
            decodeTo: '"',
            decodeMatch: '"'
        },
        {
            key: "'",
            url: true,
            html: true,
            encodeTo: '&#x27;',
            encodeMatch: '&#x27;',
            decodeTo: "'",
            decodeMatch: "'"
        },
        {
            key: '/',
            url: false,
            html: true,
            encodeTo: '&#x2F;',
            encodeMatch: '&#x2F;',
            decodeTo: '/',
            decodeMatch: '/'
        },
        {
            key: '(',
            url: true,
            html: false,
            encodeTo: '&#40;',
            encodeMatch: '&#40;',
            decodeTo: '(',
            decodeMatch: '\\('
        },
        {  
            key: ')',
            url: true,
            html: false,
            encodeTo: '&#41;',
            encodeMatch: '&#41;',
            decodeTo: ')',
            decodeMatch: '\\)'
        }
    ];

    if (encodeMapExtensions) {
        let replacementValues = encodeMapExtensions.filter(
            ({ key }) =>
                !!maps.find(({ key: mapKey }) => {
                    return mapKey === key;
                })
        );
    
        let extensionValues = encodeMapExtensions.filter(
            ({ key }) =>
                !maps.find(({ key: mapKey }) => {
                    return mapKey === key;
                })
        );
    
        maps = maps.map(item => {
            let replacementValue = replacementValues.find(({ key: replacementKey }) => {
                return replacementKey === item.key;
            });
    
            if (replacementValue) {
                return replacementValue;
            }
    
            return item;
        });
    
        maps = maps.concat(extensionValues);
    }

    if (mtype === EncodeTarget.Html) {
        return maps.filter(({html}) =>  html);
    } else { // for url
        return maps.filter(({url}) =>  url);
    }
}
function encodeMapping(str: string, mapping: IEncodeMapExtension) {
    return str.replace(new RegExp(mapping.decodeMatch, 'g'), mapping.encodeTo);
}
function decodeMapping(str: string, mapping: IEncodeMapExtension) {
    return str.replace(new RegExp(mapping.encodeMatch, 'g'), mapping.decodeTo);
}
export {
    makeStartTag,
    makeEndTag,
    encodeHtml,
    decodeHtml,
    encodeLink,
    ITagKeyValue,
    IEncodeMapExtension
};
