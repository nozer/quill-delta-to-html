function sanitize(str: string, protocolWhitelist: string[] = []): string {
  let val = str;
  val = val.replace(/^\s*/gm, '');

  let whiteList = new RegExp(
    `^((https?|s?ftp|file|blob|mailto|tel|${protocolWhitelist.join(
      '|'
    )}):|#|\\/|data:image\\/)`
  );
  if (whiteList.test(val)) {
    return val;
  }
  return 'unsafe:' + val;
}

export { sanitize };
