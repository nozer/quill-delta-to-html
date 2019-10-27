function sanitize(str: string): string {
  let val = str;
  val = val.replace(/^\s*/gm, '');
  let whiteList = /^((https?|s?ftp|file|blob|mailto|tel):|#|\/|data:image\/)/;
  if (whiteList.test(val)) {
    return val;
  }
  return 'unsafe:' + val;
}

export { sanitize };
