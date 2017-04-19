function makeStartTag(tag:any, attrs:any = null) {
    if (!tag) {return ''; }
    

    var attrsStr = '';
    if (attrs) {
        attrs = [].concat(attrs);
        attrsStr = attrs.map(function(attr:any){
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
    return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}

function encodeHtml(str: string, preventDoubleEncoding = true) {
    if (preventDoubleEncoding) {
        str = decodeHtml(str);
    }
    return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");

}

export {
    makeStartTag,
    makeEndTag,
    encodeHtml,
    decodeHtml
};
