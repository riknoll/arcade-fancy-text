"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trimGlyph = exports.hexEncodeFont = exports.changeFontMeta = exports.deserializeFont = exports.serializeFont = exports.Font = void 0;
const buffer_1 = require("./buffer");
const glyph_1 = require("./glyph");
const defaultCharacters = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,?!:;"'*+-=<>()[]{}/\\#$%&@^_\`|~`;
class Font {
    constructor(meta, glyphs) {
        this.meta = meta;
        if (glyphs) {
            this.glyphs = glyphs;
            return;
        }
        this.glyphs = [];
        for (const char of defaultCharacters) {
            this.glyphs.push((0, glyph_1.createGlyph)(meta, char));
        }
    }
    updateGlyph(glyph) {
        return new Font(this.meta, this.glyphs.map(g => g.character === glyph.character ? glyph : g));
    }
}
exports.Font = Font;
function serializeFont(font) {
    return JSON.stringify({
        meta: font.meta,
        glyphs: font.glyphs.map(glyph_1.serializeGlyph)
    });
}
exports.serializeFont = serializeFont;
function deserializeFont(data) {
    const parsed = JSON.parse(data);
    return new Font(parsed.meta, parsed.glyphs.map(glyph_1.deserializeGlyph));
}
exports.deserializeFont = deserializeFont;
function changeFontMeta(font, newMeta) {
    const newGlyphs = [];
    const oldBase = font.meta.ascenderHeight + font.meta.defaultHeight;
    const newBase = newMeta.ascenderHeight + newMeta.defaultHeight;
    const yShift = newBase - oldBase;
    const xShift = newMeta.kernWidth - font.meta.kernWidth;
    for (const glyph of font.glyphs) {
        const newGlyph = (0, glyph_1.createGlyph)(newMeta, glyph.character);
        for (let x = 0; x < glyph.width; x++) {
            for (let y = 0; y < glyph.height; y++) {
                if (!(0, glyph_1.getPixel)(glyph, x, y))
                    continue;
                (0, glyph_1.setPixel)(newGlyph, x + xShift, y + yShift, true);
            }
        }
        newGlyphs.push(newGlyph);
    }
    return new Font(newMeta, newGlyphs);
}
exports.changeFontMeta = changeFontMeta;
const MAGIC = 0x68f119db;
/**
 * Encoded font format
 *
 * Follows the structure of Header -> Lookup Table -> Bitmaps
 *
 * Every character in the font gets an entry in the lookup table
 * that contains glyph metadata and points to the bitmap location.
 * Lookup table is sorted by char code. Bitmaps are encoded in F4
 * 1 bpp format, but don't include the header
 *
 * Header (12 bytes):
 *  [0..3]   magic
 *  [4..5]   number of characters
 *  [6]      line height
 *  [7]      baseline offset
 *  [8]      letter spacing
 *  [9]      word spacing
 *  [10..11] byte length of longest bitmap
 * LookupTableEntry (4 bytes):
 *  [0..1]   character code
 *  [2..3]   bitmap entry offset
 * BitmapEntry (5 + N bytes)
 *  [0]      char width
 *  [1]      bitmap width
 *  [2]      bitmap height
 *  [3]      char x offset (signed, relative to left line)
 *  [4]      char y offset (signed, relative to baseline)
 *  [5..N]   pixel data
 *
 * Bitmap data length = width * ((height + 7) >> 3)
 */
function hexEncodeFont(font) {
    const glyphs = font.glyphs
        .map(g => trimGlyph(g, font))
        .filter(e => !!e)
        .sort((a, b) => a[0].character.charCodeAt(0) - b[0].character.charCodeAt(0));
    const numGlyphs = glyphs.length;
    const headerBuf = new Uint8Array(12 + 4 * numGlyphs);
    (0, buffer_1.setNumber)(headerBuf, buffer_1.NumberFormat.UInt32LE, 0, MAGIC);
    (0, buffer_1.setNumber)(headerBuf, buffer_1.NumberFormat.UInt16LE, 4, numGlyphs);
    (0, buffer_1.setNumber)(headerBuf, buffer_1.NumberFormat.UInt8LE, 6, font.meta.ascenderHeight + font.meta.defaultHeight + font.meta.descenderHeight);
    (0, buffer_1.setNumber)(headerBuf, buffer_1.NumberFormat.UInt8LE, 7, font.meta.ascenderHeight + font.meta.defaultHeight);
    (0, buffer_1.setNumber)(headerBuf, buffer_1.NumberFormat.UInt8LE, 8, font.meta.letterSpacing);
    (0, buffer_1.setNumber)(headerBuf, buffer_1.NumberFormat.UInt8LE, 9, font.meta.wordSpacing);
    let pixelBytes = 0;
    let maxLength = 0;
    const bitmaps = [];
    for (let i = 0; i < numGlyphs; i++) {
        const offset = 12 + 4 * i;
        const [trimmedGlyph, pixels] = glyphs[i];
        (0, buffer_1.setNumber)(headerBuf, buffer_1.NumberFormat.UInt16LE, offset, trimmedGlyph.character.charCodeAt(0));
        (0, buffer_1.setNumber)(headerBuf, buffer_1.NumberFormat.UInt16LE, offset + 2, pixelBytes);
        maxLength = Math.max(pixels.length, maxLength);
        const bitmapEntry = new Uint8Array(5 + pixels.length);
        bitmaps.push(bitmapEntry);
        (0, buffer_1.setNumber)(bitmapEntry, buffer_1.NumberFormat.UInt8LE, 0, trimmedGlyph.width + trimmedGlyph.xOffset);
        (0, buffer_1.setNumber)(bitmapEntry, buffer_1.NumberFormat.UInt8LE, 1, trimmedGlyph.width);
        (0, buffer_1.setNumber)(bitmapEntry, buffer_1.NumberFormat.UInt8LE, 2, trimmedGlyph.height);
        (0, buffer_1.setNumber)(bitmapEntry, buffer_1.NumberFormat.Int8LE, 3, trimmedGlyph.xOffset);
        (0, buffer_1.setNumber)(bitmapEntry, buffer_1.NumberFormat.Int8LE, 4, trimmedGlyph.yOffset);
        bitmapEntry.set(pixels, 5);
        pixelBytes += bitmapEntry.length;
    }
    (0, buffer_1.setNumber)(headerBuf, buffer_1.NumberFormat.UInt16LE, 10, maxLength);
    const outBuffer = new Uint8Array(headerBuf.length + pixelBytes);
    outBuffer.set(headerBuf, 0);
    let offset = 0;
    for (const bitmap of bitmaps) {
        outBuffer.set(bitmap, headerBuf.length + offset);
        offset += bitmap.length;
    }
    return (0, buffer_1.uint8ArrayToHex)(outBuffer);
}
exports.hexEncodeFont = hexEncodeFont;
function trimGlyph(glyph, font) {
    let minX = glyph.width;
    let maxX = 0;
    let minY = glyph.height;
    let maxY = 0;
    let hasPixel = false;
    for (let x = 0; x < glyph.width; x++) {
        for (let y = 0; y < glyph.height; y++) {
            if ((0, glyph_1.getPixel)(glyph, x, y)) {
                minX = Math.min(x, minX);
                minY = Math.min(y, minY);
                maxX = Math.max(x, maxX);
                maxY = Math.max(y, maxY);
                hasPixel = true;
            }
        }
    }
    if (!hasPixel)
        return undefined;
    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    const newGlyph = {
        character: glyph.character,
        width,
        height,
        pixels: new Uint8Array(width * byteHeight(height)),
        xOffset: minX - font.meta.kernWidth,
        yOffset: minY - (font.meta.ascenderHeight + font.meta.defaultHeight)
    };
    for (let x = 0; x < glyph.width; x++) {
        for (let y = 0; y < glyph.height; y++) {
            if ((0, glyph_1.getPixel)(glyph, x, y)) {
                (0, glyph_1.setPixel)(newGlyph, x - minX, y - minY, true);
            }
        }
    }
    const encoded = f4EncodeImg(newGlyph.width, newGlyph.height, (x, y) => (0, glyph_1.getPixel)(glyph, minX + x, minY + y) ? 1 : 0);
    return [newGlyph, encoded];
}
exports.trimGlyph = trimGlyph;
function byteHeight(h) {
    return (h + 7) >> 3;
}
function f4EncodeImg(w, h, getPix) {
    const columnBytes = byteHeight(h);
    const out = new Uint8Array(w * columnBytes);
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            if (getPix(x, y)) {
                const index = columnBytes * x + (y >> 3);
                const mask = 1 << (y & 7);
                out[index] |= mask;
            }
        }
    }
    return out;
}
//# sourceMappingURL=font.js.map