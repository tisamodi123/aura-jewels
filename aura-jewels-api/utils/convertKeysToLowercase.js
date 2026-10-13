export const convertKeysToLowercase = (obj) => {
    if (typeof obj !== "object" || obj === null) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => convertKeysToLowercase(item));
    }

    let newObj = {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            newObj[key.toLowerCase()] = convertKeysToLowercase(obj[key]);
        }
    }
    return newObj;
}