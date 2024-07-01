'use strict';
const Url = require('url');
const Path = require('path');
exports.getFileType = function (file_name) {
    return Path.extname(Url.parse(file_name).pathname);
};
exports.getMediaType = function (file_name) {
    var _a;
    try {
        let extension = (_a = exports.getFileType(file_name)) !== null && _a !== void 0 ? _a : '';
        return MEDIA_TYPES[extension];
    }
    catch (err) {
        console.log(`Media type not found for ${file_name}`);
    }
};
/**
 * Exhaustive list of all iana media types: https://www.iana.org/assignments/media-types/media-types.xhtml
 */
const MEDIA_TYPES = {
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.tiff': 'image/tiff',
    '.bmp': 'image/bmp',
    '.pdf': 'application/pdf',
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.gif': 'image/gif',
    '.heic': 'image/heic',
    '.txt': 'text/plain',
    '.wav': 'audio/wav',
    '.mpeg': 'audio/mpeg',
    '.ogg': 'audio/ogg'
};
