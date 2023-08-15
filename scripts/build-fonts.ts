import { Font, deserializeFont, hexEncodeFont, trimGlyph } from "../../font-editor/src/lib/font";
import fs = require("fs");
import path = require("path");
import * as canvas from "canvas";
import { Glyph, createGlyph, getPixel } from "../../font-editor/src/lib/glyph";

const testText = `The Quick Brown Fox Jumped Over The Lazy Dog`;
const testText2 = `Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz 0123456789 .!?"'(){}[]`;
async function main() {
    const fontRoot = path.resolve("../fonts");
    const previewRoot = path.resolve("../previews");
    const markdownPath = path.resolve("../README.md");
    const tsPath = path.resolve("../built-fonts.ts");
    const root = path.dirname(markdownPath);

    const fontFiles = fs.readdirSync(fontRoot);
    let markdownOut = "";
    let namespaceOut = "";

    for (const file of fontFiles) {
        const p = path.join(fontRoot, file);

        const text = fs.readFileSync(p, { encoding: "utf-8" });
        const parsed = deserializeFont(text);
        const c = renderFont(parsed, testText2);
        const scaled = scaleCanvas(c, 4);

        const outFile = path.join(previewRoot, file.split(".")[0] + ".png")
        const out = fs.createWriteStream(outFile);
        const stream = scaled.createPNGStream();
        stream.pipe(out);
        out.on("finish", () => console.log("wrote " + outFile));

        const nameParts = file.split(".")[0].split("-");
        const name = nameParts.filter(p => p !== "font").join(" ");
        const id = name.replace(/ /g, "_");

        const encoded = hexEncodeFont(parsed);

        markdownOut += `### ${name}\n\n`;
        markdownOut += `* Character height: ${parsed.meta.defaultHeight}\n`;
        markdownOut += `* Line height: ${parsed.meta.defaultHeight + parsed.meta.ascenderHeight + parsed.meta.descenderHeight}\n\n`;
        markdownOut += `![Preview of ${name} font](${path.relative(root, outFile)})\n\n`;

        namespaceOut += `    //% whenUsed\n`;
        namespaceOut += `    //% fixedInstance\n`;
        namespaceOut += `    //% block="${name}"\n`;
        namespaceOut += `    //% blockIdentity="fancyText.__fontPicker"\n`;
        namespaceOut += `    export const ${id}: fancyText.BaseFont = new Font(hex\`${encoded}\`);\n\n`
    }

    const markdown = fs.readFileSync(markdownPath, { encoding: "utf-8" });

    const prologue = markdown.split(/<!--\s*font-preview-start\s*-->/)[0];
    const epilogue = markdown.split(/<!--\s*font-preview-end\s*-->/)[1];

    const out = `${prologue}<!-- font-preview-start -->\n${markdownOut}\n<!-- font-preview-end -->${epilogue}`;
    fs.writeFileSync(markdownPath, out);
    console.log("Wrote README.md");

    let tsOut = `namespace fancyText {\n${namespaceOut}}\n`;
    tsOut = `// DO NOT EDIT! Run scripts/built-fonts.ts to generate\n\n\n` + tsOut;
    fs.writeFileSync(tsPath, tsOut)
    console.log("Wrote built-fonts.ts");
}

function renderFont(font: Font, text: string) {
    const targetAspectRatio = 2 / 1;

    const trimmedGlyphs: {[index: string]: Glyph} = {};
    const placeHolderGlyph = createGlyph(font.meta, "");
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
            const trimmed = trimGlyph(glyph, font);

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

function drawWord(word: string, glyphs: {[index: string]: Glyph}, font: Font, x: number, y: number, context: canvas.CanvasRenderingContext2D) {
    for (const char of word) {
        const glyph = glyphs[char];
        drawGlyph(
            glyph,
            x + glyph.xOffset,
            y + glyph.yOffset + font.meta.ascenderHeight + font.meta.defaultHeight,
            context
        );
        x += glyph.xOffset + glyph.width + font.meta.letterSpacing;
    }
}

function drawGlyph(glyph: Glyph, x: number, y: number, context: canvas.CanvasRenderingContext2D) {
    for (let ix = 0; ix < glyph.width; ix++) {
        for (let iy = 0; iy < glyph.height; iy++) {
            if (getPixel(glyph, ix, iy)) {
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
                context.fillRect(x * scaleFactor, y * scaleFactor, scaleFactor, scaleFactor);
            }
        }
    }

    return out;
}

main();