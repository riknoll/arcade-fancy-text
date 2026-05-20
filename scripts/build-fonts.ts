import { Font, FontMeta, deserializeFont, hexEncodeFont, trimSortKern } from "../../font-editor/src/lib/font";
import fs = require("fs");
import path = require("path");
import parsePng = require("parse-png");
import * as canvas from "canvas";
import { Glyph, createGlyph, getPixel, setPixel } from "../../font-editor/src/lib/glyph";

const testText2 = `Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz 0123456789 .:!?"'(){}[]`;
const uppercaseText = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.:!?\"'(){}[]";
async function main() {
    const fontRoot = path.resolve("fonts");
    const previewRoot = path.resolve("previews");
    const builtFontRoot = path.resolve("built-fonts");
    const markdownPath = path.resolve("README.md");
    const pxtJsonPath = path.resolve("pxt.json");
    const root = path.dirname(markdownPath);

    const fontFiles = fs.readdirSync(fontRoot);
    let markdownOut = "";
    const builtFiles: string[] = [];

    if (fs.existsSync(builtFontRoot)) {
        fs.rmSync(builtFontRoot, { recursive: true, force: true });
    }

    fs.mkdirSync(builtFontRoot);

    for (const file of fontFiles) {
        const p = path.join(fontRoot, file);

        let parsed: Font;
        if (path.extname(p) === ".png") {
            parsed = await parseFontFromPng(p);
        }
        else if (path.extname(p) === ".json") {
            const text = fs.readFileSync(p, { encoding: "utf-8" });
            parsed = deserializeFont(text);
        }
        else {
            continue;
        }

        const hasLowercase = parsed.glyphs.some(g => g.character >= "a" && g.character <= "z");

        const c = hasLowercase ? renderFont(parsed, testText2, true) : renderFont(parsed, uppercaseText, false);
        const scaled = scaleCanvas(c, 4);

        const outPng = path.join(previewRoot, file.split(".")[0] + ".png");
        const outFile = file.split(".")[0] + ".ts";
        const out = fs.createWriteStream(outPng);
        const stream = scaled.createPNGStream();
        stream.pipe(out);
        out.on("finish", () => console.log("wrote " + outPng));

        const nameParts = file.split(".")[0].split("-");
        const name = nameParts.filter(p => p !== "font").join(" ");
        const id = name.replace(/ /g, "_");

        const encoded = hexEncodeFont(parsed);

        markdownOut += `### ${name}\n\n`;
        markdownOut += `* Character height: ${parsed.meta.defaultHeight}\n`;
        markdownOut += `* Line height: ${parsed.meta.defaultHeight + parsed.meta.ascenderHeight + parsed.meta.descenderHeight}\n\n`;
        markdownOut += `![Preview of ${name} font](${path.relative(root, outPng)})\n\n`;

        let tsOut = `// DO NOT EDIT! Run scripts/build-fonts.ts to generate\n\n\n`
        tsOut += `namespace fancyText {\n`
        tsOut += `    //% whenUsed\n`;
        tsOut += `    //% fixedInstance\n`;
        tsOut += `    //% block="${name}"\n`;
        tsOut += `    //% blockIdentity="fancyText.__fontPicker"\n`;
        tsOut += `    export const ${id}: fancyText.BaseFont = new Font(hex\`${encoded}\`);\n\n`
        tsOut += `}\n`;

        fs.writeFileSync(path.join(builtFontRoot, outFile), tsOut, "utf-8");
        console.log(`Wrote built-fonts/${outFile}`)

        builtFiles.push(`built-fonts/${outFile}`)
    }

    const markdown = fs.readFileSync(markdownPath, { encoding: "utf-8" });

    const prologue = markdown.split(/<!--\s*font-preview-start\s*-->/)[0];
    const epilogue = markdown.split(/<!--\s*font-preview-end\s*-->/)[1];

    const out = `${prologue}<!-- font-preview-start -->\n${markdownOut}\n<!-- font-preview-end -->${epilogue}`;
    fs.writeFileSync(markdownPath, out);
    console.log("Wrote README.md");

    const pxtJson = JSON.parse(fs.readFileSync(pxtJsonPath, "utf-8"));
    pxtJson.files = (pxtJson.files as string[]).filter(file => !file.startsWith("built-fonts") && file !== "main.ts").concat(builtFiles).concat(["main.ts"]);
    fs.writeFileSync(pxtJsonPath, JSON.stringify(pxtJson, null, 4), "utf-8")
    console.log("Wrote pxt.json");
}

function renderFont(font: Font, text: string, splitOnSpace: boolean) {
    const targetAspectRatio = 2 / 1;

    font = trimSortKern(font);

    const trimmedGlyphs: { [index: string]: Glyph } = {};

    for (let i = 0; i < text.length; i++) {
        const char = text.charAt(i);

        if (char === " ") {
            continue;
        }
        if (!trimmedGlyphs[char]) {
            const glyph = font.glyphs.find(g => g.character === char);
            if (!glyph) continue;
            trimmedGlyphs[char] = glyph;
        }
    }

    const space = splitOnSpace ? font.meta.wordSpacing : font.meta.letterSpacing;
    const words = text.split(splitOnSpace ? " " : "");
    const wordWidths = words.map(word => {
        let width = 0;

        for (const char of word) {
            const glyph = trimmedGlyphs[char];
            if (!glyph) continue;
            width += glyph.width + glyph.xOffset + font.meta.letterSpacing;
        }

        return width;
    });

    const lineHeight = font.meta.defaultHeight + font.meta.descenderHeight + font.meta.ascenderHeight + 1;

    let bestLines = 1;
    let bestAspectRatio = 0;
    let bestWidth = 0;

    for (let i = 1; i < 10; i++) {
        let maxWidth = 0;
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
            maxWidth = Math.max(x, maxWidth)

            if (x + space > width) {
                x = font.meta.kernWidth;
                line++;
            }
            else {
                x += space;
            }
        }

        if (x === font.meta.kernWidth) line--;

        if (line > i) {
            continue;
        }

        const aspectRatio = width / (line * lineHeight);

        if (Math.abs(aspectRatio - targetAspectRatio) < Math.abs(bestAspectRatio - targetAspectRatio)) {
            bestAspectRatio = aspectRatio;
            bestLines = line;
            bestWidth = maxWidth;
        }
    }

    const padding = 2;

    const render = canvas.createCanvas(
        bestWidth + padding * 2,
        lineHeight * bestLines + padding * 2
    );

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

function drawWord(word: string, glyphs: { [index: string]: Glyph }, font: Font, x: number, y: number, context: canvas.CanvasRenderingContext2D) {
    for (const char of word) {
        const glyph = glyphs[char];
        if (!glyph) continue;
        drawGlyph(
            glyph,
            x + glyph.xOffset,
            y + glyph.yOffset + font.meta.ascenderHeight + font.meta.defaultHeight,
            font.meta.twoTone,
            context
        );
        x += glyph.xOffset + glyph.width + font.meta.letterSpacing;
    }
}

function drawGlyph(glyph: Glyph, x: number, y: number, twoTone: boolean, context: canvas.CanvasRenderingContext2D) {
    for (let ix = 0; ix < glyph.width; ix++) {
        for (let iy = 0; iy < glyph.height; iy++) {
            if (twoTone && getPixel(glyph, ix, iy, 1)) {
                context.fillStyle = "#aaaaaa"
                context.fillRect(x + ix, y + iy, 1, 1);
            }
            else if (getPixel(glyph, ix, iy, 0)) {
                context.fillStyle = "black"
                context.fillRect(x + ix, y + iy, 1, 1);
            }
        }
    }
}

function scaleCanvas(target: canvas.Canvas, scaleFactor: number) {
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
                context.fillStyle = `rgb(${inData.data[index]},${inData.data[index + 1]},${inData.data[index + 2]})`
                context.fillRect(x * scaleFactor, y * scaleFactor, scaleFactor, scaleFactor);
            }
        }
    }

    return out;
}

class Bitmask {
    protected mask: Uint8Array;

    constructor(public width: number, public height: number) {
        this.mask = new Uint8Array(Math.ceil(width * height / 8));
    }

    set(col: number, row: number) {
        const cellIndex = col + this.width * row;
        const index = cellIndex >> 3;
        const offset = cellIndex & 7;
        this.mask[index] |= (1 << offset);
    }

    get(col: number, row: number) {
        const cellIndex = col + this.width * row;
        const index = cellIndex >> 3;
        const offset = cellIndex & 7;
        return (this.mask[index] >> offset) & 1;
    }
}

interface PNGGlyphLayer {
    mask: Bitmask;
    color: string;
}

interface PNGGlyph {
    width: number;
    height: number;
    layers: PNGGlyphLayer[];
}

async function parseFontFromPng(p: string): Promise<Font> {
    const data = fs.readFileSync(p);
    const png = await parsePng(data);

    let rowStart = 0;
    const glyphs: PNGGlyph[] = [];

    let maxWidth = 0;
    let maxHeight = 0;


    for (let y = 0; y < png.height + 1; y++) {
        let empty = true;
        for (let x = 0; x < png.width; x++) {
            if (!isEmptyPixel(x, y, png)) {
                empty = false;
                break;
            }
        }
        if (empty) {
            if (y > rowStart + 1) {
                let colStart = 0;
                for (let x = 0; x < png.width + 1; x++) {
                    let colEmpty = true;
                    for (let yy = rowStart; yy < y; yy++) {
                        if (!isEmptyPixel(x, yy, png)) {
                            colEmpty = false;
                            break;
                        }
                    }
                    if (colEmpty) {
                        if (x > colStart + 1) {
                            const glyph = extractGlyph(png, colStart, rowStart, x, y);
                            if (glyph.layers.length) {
                                maxWidth = Math.max(maxWidth, glyph.width);
                                maxHeight = Math.max(maxHeight, glyph.height);
                                glyphs.push(glyph);
                            }
                        }
                        colStart = x;
                    }
                }
            }
            rowStart = y;
        }
    }

    const letters = fs.readFileSync(p.replace(".png", ".txt"), "utf-8").split("");

    const fontMeta: FontMeta = {
        defaultWidth: maxWidth,
        defaultHeight: maxHeight,
        descenderHeight: 0,
        ascenderHeight: 0,
        xHeight: 0,
        kernWidth: 0,
        autoKern: true,
        letterSpacing: 1,
        wordSpacing: Math.max(maxWidth >> 2, 3),
        lineSpacing: 1,
        twoTone: glyphs.some(g => g.layers.length > 1)
    };

    const fontGlyphs: Glyph[] = glyphs.map((g, i) => pngGlyphToGlyph(g, fontMeta, letters[i], fontMeta.twoTone ? ["#000000", "#ffffff"] : ["#000000"]));
    return new Font(fontMeta, fontGlyphs);;
}

function pngGlyphToGlyph(pngGlyph: PNGGlyph, meta: FontMeta, character: string, colors: string[]): Glyph {
    const glyph = createGlyph(meta, character);
    const yOffset = meta.defaultHeight - pngGlyph.height;

    for (let colorIndex = 0; colorIndex < colors.length; colorIndex++) {
        const layer = pngGlyph.layers.find(l => l.color === colors[colorIndex]);

        if (!layer) continue;

        for (let x = 0; x < pngGlyph.width; x++) {
            for (let y = 0; y < pngGlyph.height; y++) {
                if (layer.mask.get(x, y)) {
                    setPixel(glyph, x, y + yOffset, colorIndex, true);
                }
            }
        }
    }

    return glyph;
}

function isEmptyPixel(x: number, y: number, png: any): boolean {
    if (x >= png.width || y >= png.height) return true;

    const index = (x + y * png.width) << 2;
    return !png.data[index + 3];
}

function extractGlyph(png: any, xStart: number, yStart: number, xEnd: number, yEnd: number): PNGGlyph {
    const width = xEnd - xStart;
    const height = yEnd - yStart;

    const layers: PNGGlyphLayer[] = [];

    for (let x = xStart; x < xEnd; x++) {
        for (let y = yStart; y < yEnd; y++) {
            const index = (x + y * png.width) << 2;
            const alpha = png.data[index + 3];
            if (alpha) {
                const color = rgbToHex(png.data[index], png.data[index + 1], png.data[index + 2]);
                let layer = layers.find(l => l.color === color);
                if (!layer) {
                    layer = {
                        color,
                        mask: new Bitmask(width, height)
                    };
                    layers.push(layer);
                }
                layer.mask.set(x - xStart, y - yStart);
            }
        }
    }

    return {
        width,
        height,
        layers
    };
}

function rgbToHex(r: number, g: number, b: number) {
    return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

main();