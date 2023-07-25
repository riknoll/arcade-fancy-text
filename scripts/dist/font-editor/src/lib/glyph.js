"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shiftGlyph = exports.deserializeGlyph = exports.serializeGlyph = exports.setPixel = exports.getPixel = exports.clearGlyph = exports.createGlyph = void 0;
const buffer_1 = require("./buffer");
function createGlyph(font, character) {
    return {
        character,
        width: font.kernWidth + font.defaultWidth,
        height: font.ascenderHeight + font.descenderHeight + font.defaultHeight,
        xOffset: 0,
        yOffset: 0,
        pixels: new Uint8Array((((font.kernWidth + font.defaultWidth) * (font.ascenderHeight + font.defaultHeight + font.descenderHeight)) >> 3) + 1)
    };
}
exports.createGlyph = createGlyph;
function clearGlyph(g) {
    return g.pixels.fill(0);
}
exports.clearGlyph = clearGlyph;
function getPixel(g, x, y) {
    const cellIndex = x + g.width * y;
    const index = cellIndex >> 3;
    const offset = cellIndex & 7;
    return !!((g.pixels[index] >> offset) & 1);
}
exports.getPixel = getPixel;
function setPixel(g, x, y, on) {
    if (x < 0 || x >= g.width || y < 0 || y >= g.height)
        return;
    const cellIndex = x + g.width * y;
    const index = cellIndex >> 3;
    const offset = cellIndex & 7;
    if (on) {
        g.pixels[index] |= (1 << offset);
    }
    else {
        g.pixels[index] &= ~(1 << offset);
    }
}
exports.setPixel = setPixel;
function serializeGlyph(glyph) {
    return JSON.stringify(Object.assign(Object.assign({}, glyph), { pixels: btoa((0, buffer_1.uint8ArrayToString)(glyph.pixels)) }));
}
exports.serializeGlyph = serializeGlyph;
function deserializeGlyph(encoded) {
    const parsed = JSON.parse(encoded);
    return Object.assign(Object.assign({}, parsed), { pixels: (0, buffer_1.stringToUint8Array)(atob(parsed.pixels)) });
}
exports.deserializeGlyph = deserializeGlyph;
function shiftGlyph(glyph, xShift, yShift) {
    const newGlyph = Object.assign(Object.assign({}, glyph), { pixels: new Uint8Array(glyph.pixels.length) });
    for (let x = 0; x < glyph.width; x++) {
        for (let y = 0; y < glyph.height; y++) {
            if (getPixel(glyph, x, y)) {
                setPixel(newGlyph, x + xShift, y + yShift, true);
            }
        }
    }
    return newGlyph;
}
exports.shiftGlyph = shiftGlyph;
//# sourceMappingURL=glyph.js.map