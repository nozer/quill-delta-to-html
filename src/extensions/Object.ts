
interface ObjectConstructor {
    _assign(target: any, obj1: any, obj2?: any): any,
}


// Copied from mdn's Object.assign 
Object._assign = function (target: any, varArg1: any, varArg2: any = null) {

    // TypeError if undefined or null
    if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
    }

    var to = Object(target);

    for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) { // Skip over if undefined or null
            for (var nextKey in nextSource) {
                // Avoid bugs when hasOwnProperty is shadowed
                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                    to[nextKey] = nextSource[nextKey];
                }
            }
        }
    }
    return to;
};


