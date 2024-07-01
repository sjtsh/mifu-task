"use strict";
/**
 * Finds object from an array
 * @param {array} arr
 * @param {object} obj
 * @returns
 */
exports.find = function (arr, obj) {
    if (arr == null) {
        return;
    }
    return arr.find((ele) => {
        return obj && Object.keys(obj).every(key => ele[key] === obj[key]);
    }) || arr[0];
};
exports.safeGet = function (obj, path, defaultValue = null) {
    return path.split('.').reduce((o, k) => (o || {})[k], obj) || defaultValue;
};
/**
 * Returns object of only specified keys
 *
 * @param {object} obj
 * @param {array} only_keys
 * @returns
 */
exports.only = function (obj, only_keys) {
    return Object.fromEntries(only_keys.map(key => { var _a; return (_a = [key, obj[key]]) !== null && _a !== void 0 ? _a : null; }));
};
/**
 * Checks if entries in entries_list are present in obj
 * @param {*} entries_list
 * @param {*} obj
 * @returns
 */
exports.checkEntriesInObject = function (entries_list, obj) {
    obj = obj ? obj : {};
    entries_list = entries_list ? entries_list : [];
    return entries_list.every(entry => Object.keys(obj).includes(entry));
};
