// Copied from mdn's Object.assign
function assign(
  target: any,
  ...sources: any[] /*, one or more source objects */
) {
  // TypeError if undefined or null
  if (target == null) {
    throw new TypeError('Cannot convert undefined or null to object');
  }

  var to = Object(target);

  for (var index = 0; index < sources.length; index++) {
    var nextSource = sources[index];

    if (nextSource != null) {
      // Skip over if undefined or null
      for (var nextKey in nextSource) {
        // Avoid bugs when hasOwnProperty is shadowed
        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
          to[nextKey] = nextSource[nextKey];
        }
      }
    }
  }
  return to;
}

export { assign };
