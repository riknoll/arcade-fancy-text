function drawFontText(left: number, top: number, text: string, lines: Line[], defaultColor: number, defaultFont: fancyText.BaseFont, length: number) {
    let currentLeft = left;
    for (const line of lines) {
        currentLeft = left;
        for (const span of line.spans) {
            const font = getFontForSpan2(span.flags) || defaultFont;
            const color = getColorForSpan(span.flags) || defaultColor;

            if (font.lineHeight === line.height) {
                drawFontSpan(currentLeft, top, text.substr(span.offset, span.length), font, color, span.flags, left, length);
            }
            else {
                drawFontSpan(currentLeft, top + (line.height >> 1) - (font.lineHeight >> 1), text.substr(span.offset, span.length), font, color, span.flags, left, length);
            }

            length -= span.length;
            if (length <= 0) return;

            currentLeft += getTextWidth(font, text.substr(span.offset, span.length));
        }
        top += line.height;
    }
}

function getFontForSpan2(flags: number) {
    if (flags & Tag.Font5) {
        return new fancyText.LegacyFont(image.font5);
    }
    else if (flags & Tag.Font8) {
        return new fancyText.LegacyFont(image.font8);
    }
    else if (flags & Tag.Font12) {
        return new fancyText.LegacyFont(image.font12);
    }

    return undefined;
}


function drawFontSpan(left: number, top: number, text: string, font: fancyText.BaseFont, color: number, flags: number, absoluteLeft: number, length: number) {
    if (flags & Tag.Blinking) {
        if (Math.idiv(game.runtime(), 250) % 2 === 0) {
            return;
        }
    }
    if (flags & (Tag.Wavy | Tag.Shaky | Tag.Rainbow)) {
        const tick = Math.idiv(game.runtime(), 100);
        let x = left;

        for (let i = 0; i < text.length; i++) {
            if (i >= length) return;

            let y = top;
            if (flags & Tag.Shaky) {
                x += randint(-1, 1);
                y += randint(-1, 1);
            }
            if (flags & Tag.Wavy) {
                y += Math.sin(((x - absoluteLeft) / 10) + tick) * 2;
            }
            if (flags & Tag.Rainbow) {
                color = rainbow.getPixel((Math.idiv(x - absoluteLeft, font.wordSpacing) + tick) % rainbow.width, 0);
            }
            const char = text.charAt(i);
            const code = text.charCodeAt(i);

            fancyText.printText(screen, font, char, x, y, color);

            if (char == " " || !font.isInFont(code)) {
                x += font.wordSpacing;
            }
            else {
                x += font.charWidth(code) + font.letterSpacing;
            }
        }
    }
    else if (length < text.length) {
        fancyText.printText(screen, font, text.substr(0, length), left, top, color);
    }
    else {
        fancyText.printText(screen, font, text, left, top, color);
    }
}

function getTextWidth(font: fancyText.BaseFont, text: string) {
    let w = 0;
    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (code === 32 || !font.isInFont(code)) {
            w += font.wordSpacing;
        }
        else {
            w += font.charWidth(code) + font.letterSpacing;
        }
    }
    return w;
}