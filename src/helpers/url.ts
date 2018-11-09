function sanitize(str: string, urlWhiteListExtensions?: string[]): string {
   let val = str;
   val = val.replace(/^\s*/gm, '')
   let whiteList = new RegExp(`^\s*((|https?|s?ftp|file|blob|mailto|tel):${urlWhiteListExtensions ? '|' + urlWhiteListExtensions.join('|') : ''}|#|\/|data:image\/)`)
   if (whiteList.test(val)) {
      return val;
   }
   return 'unsafe:' + val;
}

export {sanitize}