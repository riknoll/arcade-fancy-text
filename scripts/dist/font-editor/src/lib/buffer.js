"use strict";
// Copied from libgeneric.ts in pxt
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringToUint8Array = exports.uint8ArrayToString = exports.uint8ArrayToHex = exports.hexToUint8Array = exports.setNumber = exports.getNumber = exports.NumberFormat = void 0;
var NumberFormat;
(function (NumberFormat) {
    NumberFormat[NumberFormat["Int8LE"] = 1] = "Int8LE";
    NumberFormat[NumberFormat["UInt8LE"] = 2] = "UInt8LE";
    NumberFormat[NumberFormat["Int16LE"] = 3] = "Int16LE";
    NumberFormat[NumberFormat["UInt16LE"] = 4] = "UInt16LE";
    NumberFormat[NumberFormat["Int32LE"] = 5] = "Int32LE";
    NumberFormat[NumberFormat["Int8BE"] = 6] = "Int8BE";
    NumberFormat[NumberFormat["UInt8BE"] = 7] = "UInt8BE";
    NumberFormat[NumberFormat["Int16BE"] = 8] = "Int16BE";
    NumberFormat[NumberFormat["UInt16BE"] = 9] = "UInt16BE";
    NumberFormat[NumberFormat["Int32BE"] = 10] = "Int32BE";
    NumberFormat[NumberFormat["UInt32LE"] = 11] = "UInt32LE";
    NumberFormat[NumberFormat["UInt32BE"] = 12] = "UInt32BE";
    NumberFormat[NumberFormat["Float32LE"] = 13] = "Float32LE";
    NumberFormat[NumberFormat["Float64LE"] = 14] = "Float64LE";
    NumberFormat[NumberFormat["Float32BE"] = 15] = "Float32BE";
    NumberFormat[NumberFormat["Float64BE"] = 16] = "Float64BE";
})(NumberFormat || (exports.NumberFormat = NumberFormat = {}));
;
function fmtInfoCore(fmt) {
    switch (fmt) {
        case NumberFormat.Int8LE: return -1;
        case NumberFormat.UInt8LE: return 1;
        case NumberFormat.Int16LE: return -2;
        case NumberFormat.UInt16LE: return 2;
        case NumberFormat.Int32LE: return -4;
        case NumberFormat.UInt32LE: return 4;
        case NumberFormat.Int8BE: return -10;
        case NumberFormat.UInt8BE: return 10;
        case NumberFormat.Int16BE: return -20;
        case NumberFormat.UInt16BE: return 20;
        case NumberFormat.Int32BE: return -40;
        case NumberFormat.UInt32BE: return 40;
        case NumberFormat.Float32LE: return 4;
        case NumberFormat.Float32BE: return 40;
        case NumberFormat.Float64LE: return 8;
        case NumberFormat.Float64BE: return 80;
    }
}
function fmtInfo(fmt) {
    let size = fmtInfoCore(fmt);
    let signed = false;
    if (size < 0) {
        signed = true;
        size = -size;
    }
    let swap = false;
    if (size >= 10) {
        swap = true;
        size /= 10;
    }
    let isFloat = fmt >= NumberFormat.Float32LE;
    return { size, signed, swap, isFloat };
}
function getNumber(buf, fmt, offset) {
    let inf = fmtInfo(fmt);
    if (inf.isFloat) {
        let subarray = buf.slice(offset, offset + inf.size);
        if (inf.swap) {
            let u8 = new Uint8Array(subarray);
            u8.reverse();
        }
        if (inf.size == 4)
            return new Float32Array(subarray)[0];
        else
            return new Float64Array(subarray)[0];
    }
    let r = 0;
    for (let i = 0; i < inf.size; ++i) {
        r <<= 8;
        let off = inf.swap ? offset + i : offset + inf.size - i - 1;
        r |= buf[off];
    }
    if (inf.signed) {
        let missingBits = 32 - (inf.size * 8);
        r = (r << missingBits) >> missingBits;
    }
    else {
        r = r >>> 0;
    }
    return r;
}
exports.getNumber = getNumber;
function setNumber(buf, fmt, offset, r) {
    let inf = fmtInfo(fmt);
    if (inf.isFloat) {
        let arr = new Uint8Array(inf.size);
        if (inf.size === 4)
            new Float32Array(arr.buffer)[0] = r;
        else
            new Float64Array(arr.buffer)[0] = r;
        if (inf.swap)
            arr.reverse();
        for (let i = 0; i < inf.size; ++i) {
            buf[offset + i] = arr[i];
        }
        return;
    }
    for (let i = 0; i < inf.size; ++i) {
        let off = !inf.swap ? offset + i : offset + inf.size - i - 1;
        buf[off] = (r & 0xff);
        r >>= 8;
    }
}
exports.setNumber = setNumber;
function hexToUint8Array(hex) {
    let r = new Uint8ClampedArray(hex.length >> 1);
    for (let i = 0; i < hex.length; i += 2)
        r[i >> 1] = parseInt(hex.slice(i, i + 2), 16);
    return r;
}
exports.hexToUint8Array = hexToUint8Array;
function uint8ArrayToHex(data) {
    const hex = "0123456789abcdef";
    let res = "";
    for (let i = 0; i < data.length; ++i) {
        res += hex[data[i] >> 4];
        res += hex[data[i] & 0xf];
    }
    return res;
}
exports.uint8ArrayToHex = uint8ArrayToHex;
function uint8ArrayToString(input) {
    let len = input.length;
    let res = "";
    for (let i = 0; i < len; ++i)
        res += String.fromCharCode(input[i]);
    return res;
}
exports.uint8ArrayToString = uint8ArrayToString;
function stringToUint8Array(input) {
    let len = input.length;
    let res = new Uint8Array(len);
    for (let i = 0; i < len; ++i)
        res[i] = input.charCodeAt(i) & 0xff;
    return res;
}
exports.stringToUint8Array = stringToUint8Array;
//# sourceMappingURL=buffer.js.map