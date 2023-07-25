"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const font_1 = require("../../font-editor/src/lib/font");
const fs = require("fs");
const path = require("path");
const canvas = __importStar(require("canvas"));
const glyph_1 = require("../../font-editor/src/lib/glyph");
const testText = `The Quick Brown Fox Jumped Over The Lazy Dog`;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const fontRoot = path.resolve("../fonts");
        const previewRoot = path.resolve("../previews");
        const markdownPath = path.resolve("../README.md");
        const root = path.dirname(markdownPath);
        const fontFiles = fs.readdirSync(fontRoot);
        let markdownOut = "";
        for (const file of fontFiles) {
            const p = path.join(fontRoot, file);
            const text = fs.readFileSync(p, { encoding: "utf-8" });
            const parsed = (0, font_1.deserializeFont)(text);
            const c = renderFont(parsed, testText);
            const scaled = scaleCanvas(c, 4);
            const outFile = path.join(previewRoot, file.split(".")[0] + ".png");
            const out = fs.createWriteStream(outFile);
            const stream = scaled.createPNGStream();
            stream.pipe(out);
            out.on("finish", () => console.log("wrote " + outFile));
            const nameParts = file.split(".")[0].split("-");
            const name = nameParts.filter(p => p !== "font").join(" ");
            markdownOut += `### ${name}\n\n`;
            markdownOut += `* Character height: ${parsed.meta.defaultHeight}\n`;
            markdownOut += `* Line height: ${parsed.meta.defaultHeight + parsed.meta.ascenderHeight + parsed.meta.descenderHeight}\n\n`;
            markdownOut += `![Preview of ${name} font](${path.relative(root, outFile)})\n\n`;
        }
        const markdown = fs.readFileSync(markdownPath, { encoding: "utf-8" });
        const prologue = markdown.split(/<!--\s*font-preview-start\s*-->/)[0];
        const epilogue = markdown.split(/<!--\s*font-preview-end\s*-->/)[1];
        const out = `${prologue}<!-- font-preview-start -->\n${markdownOut}\n<!-- font-preview-end -->${epilogue}`;
        fs.writeFileSync(markdownPath, out);
    });
}
function renderFont(font, text) {
    const targetAspectRatio = 2 / 1;
    const trimmedGlyphs = {};
    const placeHolderGlyph = (0, glyph_1.createGlyph)(font.meta, "");
    placeHolderGlyph.width = font.meta.letterSpacing;
    for (let i = 0; i < text.length; i++) {
        const char = text.charAt(i);
        if (char === " ") {
            continue;
        }
        if (!trimmedGlyphs[char]) {
            const glyph = font.glyphs.find(g => g.character === char);
            if (!glyph) {
                trimmedGlyphs[char] = placeHolderGlyph;
                continue;
            }
            const trimmed = (0, font_1.trimGlyph)(glyph, font);
            if (!trimmed) {
                trimmedGlyphs[char] = placeHolderGlyph;
                continue;
            }
            trimmedGlyphs[char] = trimmed[0];
        }
    }
    const space = font.meta.wordSpacing;
    const words = text.split(" ");
    const wordWidths = words.map(word => {
        let width = 0;
        for (const char of word) {
            const glyph = trimmedGlyphs[char];
            width += glyph.width + glyph.xOffset + font.meta.letterSpacing;
        }
        return width;
    });
    const lineHeight = font.meta.defaultHeight + font.meta.descenderHeight + font.meta.ascenderHeight;
    let bestLines = 1;
    let bestAspectRatio = 0;
    for (let i = 1; i < 10; i++) {
        const width = Math.ceil(lineHeight * i * targetAspectRatio);
        let x = font.meta.kernWidth;
        let line = 1;
        for (const w of wordWidths) {
            if (x + w > width) {
                if (x === font.meta.kernWidth) {
                    line = 9999;
                    break;
                }
                else {
                    x = font.meta.kernWidth;
                    line++;
                }
            }
            x += w;
            if (x + space > width) {
                x = font.meta.kernWidth;
                line++;
            }
            else {
                x += space;
            }
        }
        if (line > i) {
            continue;
        }
        const aspectRatio = width / (line * lineHeight);
        if (Math.abs(aspectRatio - targetAspectRatio) < Math.abs(bestAspectRatio - targetAspectRatio)) {
            bestAspectRatio = aspectRatio;
            bestLines = line;
        }
    }
    const padding = 2;
    const render = canvas.createCanvas(Math.ceil(bestAspectRatio * lineHeight * bestLines) + padding * 2, lineHeight * bestLines + padding * 2);
    const context = render.getContext("2d");
    let x = font.meta.kernWidth;
    let y = 0;
    for (let i = 0; i < words.length; i++) {
        const w = wordWidths[i];
        const word = words[i];
        if (x + w > render.width) {
            if (x === font.meta.kernWidth) {
                break;
            }
            else {
                x = font.meta.kernWidth;
                y += lineHeight;
            }
        }
        drawWord(word, trimmedGlyphs, font, x + padding, y + padding, context);
        x += w;
        if (x + space > render.width) {
            x = font.meta.kernWidth;
            y += lineHeight;
        }
        else {
            x += space;
        }
    }
    return render;
}
function drawWord(word, glyphs, font, x, y, context) {
    for (const char of word) {
        const glyph = glyphs[char];
        drawGlyph(glyph, x + glyph.xOffset, y + glyph.yOffset + font.meta.ascenderHeight + font.meta.defaultHeight, context);
        x += glyph.xOffset + glyph.width + font.meta.letterSpacing;
    }
}
function drawGlyph(glyph, x, y, context) {
    for (let ix = 0; ix < glyph.width; ix++) {
        for (let iy = 0; iy < glyph.height; iy++) {
            if ((0, glyph_1.getPixel)(glyph, ix, iy)) {
                context.fillRect(x + ix, y + iy, 1, 1);
            }
        }
    }
}
function scaleCanvas(target, scaleFactor) {
    const inData = target.getContext("2d").getImageData(0, 0, target.width, target.height);
    const out = canvas.createCanvas(target.width * scaleFactor, target.height * scaleFactor);
    const context = out.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, out.width, out.height);
    context.fillStyle = "black";
    for (let x = 0; x < target.width; x++) {
        for (let y = 0; y < target.height; y++) {
            const index = (x + y * target.width) << 2;
            if (inData.data[index + 3]) {
                context.fillRect(x * scaleFactor, y * scaleFactor, scaleFactor, scaleFactor);
            }
        }
    }
    return out;
}
main();
//# sourceMappingURL=build-fonts.js.map