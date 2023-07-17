enum Tag {
    Color01 = 1 << 0,
    Color02 = 1 << 1,
    Color03 = 1 << 2,
    Color04 = 1 << 3,
    Color05 = 1 << 4,
    Color06 = 1 << 5,
    Color07 = 1 << 6,
    Color08 = 1 << 7,
    Color09 = 1 << 8,
    Color10 = 1 << 9,
    Color11 = 1 << 10,
    Color12 = 1 << 11,
    Color13 = 1 << 12,
    Color14 = 1 << 13,
    Color15 = 1 << 14,
    Font5 = 1 << 15,
    Font8 = 1 << 16,
    Font12 = 1 << 17,
    Shaky = 1 << 18,
    Wavy = 1 << 19,
    Blinking = 1 << 20,
    Rainbow = 1 << 21,
    VerySlow = 1 << 22,
    Slow = 1 << 23,
    Fast = 1 << 24,
    VeryFast = 1 << 25
}

const outLines: string[] = [];

class Span {
    constructor(public offset: number, public length: number, public flags: number) {}
}

class ParseState {
    offset: number;
    flags: number;
    spanStart: number;

    constructor() {
        this.offset = 0;
        this.flags = 0;
        this.spanStart = 0;
    }
}

function getSpans(text: string) {
    let state = new ParseState();
    const spans: Span[] = [];

    while (state.offset < text.length) {
        if (text.charAt(state.offset) === "<") {
            const newState = eatTag(text, state);

            if (newState !== state) {
                const length = state.offset - state.spanStart;
                if (length) {
                    spans.push(new Span(state.spanStart, length, state.flags));
                }
                state = newState;
            }
            else {
                state.offset++;
            }
        }
        else {
            state.offset++;
        }
    }

    return spans;
}

function isWhitespace(charCode: number) {
    return charCode <= 32;
}
function isLowerCaseLetter(charCode: number) {
    return charCode >= 97 && charCode <= 122;
}
function isUpperCaseLetter(charCode: number) {
    return charCode >= 65 && charCode <= 90;
}
function isNumber(charCode: number) {
    return charCode >= 48 && charCode <= 57;
}

function eatTag(text: string, state: ParseState) {
    const isCloseTag = text.charAt(state.offset + 1) === "/";
    let start = state.offset + 1;

    if (isCloseTag) start++;

    while (isWhitespace(text.charCodeAt(start)) && start < text.length) {
        start++;
    }

    let current = start;
    let tagName = "";

    while (current < text.length) {
        const charCode = text.charCodeAt(current);

        if (isLowerCaseLetter(charCode) || isUpperCaseLetter(charCode) || isNumber(charCode)) {
            tagName += String.fromCharCode(isUpperCaseLetter(charCode) ? charCode + 32 : charCode);
            current++;
        }
        else if (charCode === /* > */ 62) {
            current++;
            break;
        }
        else if (isWhitespace(charCode)) {
            current++;
        }
        else {
            // Invalid tag
            return state;
        }
    }

    const flag = getTagFlag(tagName);

    if (!flag || (isCloseTag && !(state.flags & flag))) return state;

    const newState = new ParseState();
    newState.offset = current;
    newState.spanStart = current;
    newState.flags = state.flags;

    if (isCloseTag) {
        newState.flags &= ~flag
    }
    else {
        newState.flags |= flag;
    }

    return newState;
}

function getTagFlag(name: string) {
    switch (name) {
        case "c1":
        case "color1":
        case "white":
            return Tag.Color01;
        case "c2":
        case "color2":
        case "red":
            return Tag.Color02;
        case "c3":
        case "color3":
        case "pink":
            return Tag.Color03;
        case "c4":
        case "color4":
        case "orange":
            return Tag.Color04;
        case "c5":
        case "color5":
        case "yellow":
            return Tag.Color05;
        case "c6":
        case "color6":
        case "teal":
            return Tag.Color06;
        case "c7":
        case "color7":
        case "green":
            return Tag.Color07;
        case "c8":
        case "color8":
        case "blue":
            return Tag.Color08;
        case "c9":
        case "color9":
        case "cyan":
            return Tag.Color09;
        case "c10":
        case "color10":
        case "purple":
            return Tag.Color10;
        case "c11":
        case "color11":
        case "lightpurple":
            return Tag.Color11;
        case "c12":
        case "color12":
        case "darkpurple":
            return Tag.Color12;
        case "c13":
        case "color13":
        case "tan":
            return Tag.Color13;
        case "c14":
        case "color14":
        case "brown":
            return Tag.Color14;
        case "c15":
        case "color15":
        case "black":
            return Tag.Color15;
        case "small":
        case "font5":
            return Tag.Font5;
        case "medium":
        case "font8":
            return Tag.Font8;
        case "big":
        case "font12":
            return Tag.Font12;
        case "shake":
        case "shaky":
            return Tag.Shaky;
        case "wave":
        case "wavy":
            return Tag.Wavy;
        case "blink":
        case "blinking":
            return Tag.Blinking;
        case "rainbow":
            return Tag.Rainbow;
        case "veryslow":
            return Tag.VerySlow;
        case "slow":
            return Tag.Slow;
        case "fast":
            return Tag.Fast;
        case "veryfast":
            return Tag.VeryFast;
    }

    return 0;
}

function getFontForSpan(flags: number) {
    if (flags & Tag.Font5) {
        return image.font5;
    }
    else if (flags & Tag.Font8) {
        return image.font8;
    }
    else if (flags & Tag.Font12) {
        return image.font12
    }

    return undefined;
}

function getColorForSpan(flags: number) {
    if (flags & Tag.Color01) {
        return 1
    }
    if (flags & Tag.Color02) {
        return 2
    }
    if (flags & Tag.Color03) {
        return 3
    }
    if (flags & Tag.Color04) {
        return 4
    }
    if (flags & Tag.Color05) {
        return 5
    }
    if (flags & Tag.Color06) {
        return 6
    }
    if (flags & Tag.Color07) {
        return 7
    }
    if (flags & Tag.Color08) {
        return 8
    }
    if (flags & Tag.Color09) {
        return 9
    }
    if (flags & Tag.Color10) {
        return 10
    }
    if (flags & Tag.Color11) {
        return 11
    }
    if (flags & Tag.Color12) {
        return 12
    }
    if (flags & Tag.Color13) {
        return 13
    }
    if (flags & Tag.Color14) {
        return 14
    }
    if (flags & Tag.Color15) {
        return 15
    }

    return 0;
}

class Line {
    spans: Span[];
    height: number;
    width: number;

    constructor() {
        this.spans = [];
        this.height = 0;
        this.width = 0;
    }

    updateDimensions(defaultFont: image.Font) {
        this.width = 0;
        this.height = 0;

        for (const span of this.spans) {
            const font = getFontForSpan(span.flags) || defaultFont;
            this.width += font.charWidth * span.length;
            this.height = Math.max(this.height, font.charHeight)
        }
    }
}

namespace SpriteKind {
    export const Text = SpriteKind.create();
}

class TextSprite extends sprites.ExtendableSprite {
    protected spans: Span[];
    protected lines: Line[];
    protected maxWidth: number;
    protected color: number;
    protected animationSpeed: number;
    protected animationOffset: number;
    protected animationTimer: number;

    constructor(public text: string) {
        super(img`1`, SpriteKind.Text);

        this.color = 1;
        this.maxWidth = 0xffffffff;
        this.setText(text);
    }

    draw(drawLeft: number, drawTop: number) {
        const font = image.getFontForText(this.text);
        drawText(drawLeft, drawTop, this.text, this.lines, this.color, font, this.animationSpeed ? this.animationOffset : this.text.length);
    }

    update(deltaTimeMillis: number) {
        if (this.animationSpeed) {
            this.animationTimer -= deltaTimeMillis;

            let didPrintCharacter = false;
            while (this.animationTimer < 0) {
                this.animationOffset++;
                this.animationTimer += this.getTimerAtOffset(this.animationOffset);
                didPrintCharacter = true;
            }

            if (this.animationOffset >= this.length()) this.animationSpeed = undefined;
        }
    }

    length(): number {
        let length = 0;

        for (const line of this.lines) {
            for (const span of line.spans) {
                length += span.length
            }
        }

        return length;
    }

    setMaxWidth(maxWidth: number) {
        this.maxWidth = maxWidth;
        this.recalculateLines();
    }

    setText(text: string) {
        this.text = text;
        this.spans = getSpans(text);
        this.recalculateLines();
    }

    getText() {
        return this.text;
    }

    setColor(color: number) {
        this.color = color;
    }

    getColor(): number {
        return this.color;
    }

    animateAtSpeed(charactersPerSecond: number) {
        this.animationSpeed = charactersPerSecond;
        this.animationOffset = 0;
        this.animationTimer = this.getTimerAtOffset(0);
    }

    animateForTime(timeMillis: number) {
        let length = 0;
        for (const line of this.lines) {
            for (const span of line.spans) {
                if (span.flags & Tag.VerySlow) {
                    length += 12 * span.length;
                }
                else if (span.flags & Tag.Slow) {
                    length += 4 * span.length;
                }
                else if (span.flags & Tag.Fast) {
                    length += 0.5 * span.length;
                }
                else if (span.flags & Tag.VeryFast) {
                    length += 0.25 * span.length;
                }
                else {
                    length += span.length;
                }
            }
        }
        this.animateAtSpeed(length * 1000 / timeMillis)
    }

    protected recalculateLines() {
        this.lines = getLines(this.text, this.spans, this.maxWidth);
        let width = 0;
        let height = 0;

        for (const line of this.lines) {
            width = Math.max(line.width, width);
            height += line.height
        }
        this.setDimensions(width, height)
    }

    protected getTimerAtOffset(offest: number) {
        const span = getSpanAtOffset(this.lines, offest);

        let timer = 1000 / this.animationSpeed;

        if (!span) return timer;

        if (span.flags & Tag.VerySlow) {
            timer *= 12;
        }
        else if (span.flags & Tag.Slow) {
            timer *= 4;
        }
        else if (span.flags & Tag.Fast) {
            timer /= 2;
        }
        else if (span.flags & Tag.VeryFast) {
            timer /= 4;
        }

        return timer;
    }
}


function getLines(text: string, spans: Span[], maxWidth: number) {
    const defaultFont = image.getFontForText(text);

    const lines: Line[] = [];
    let currentLine = new Line();

    for (let spanIndex = 0; spanIndex < spans.length; spanIndex++) {
        const currentSpan = spans[spanIndex]
        const font = getFontForSpan(currentSpan.flags) || defaultFont;
        maxWidth = Math.max(maxWidth, font.charWidth);

        let charIndex = 0;
        let lastBreakLocation = 0;
        let lastWhitespaceLocation = -1;

        function pushSpan(start: number, end: number, newLine: boolean, delta: number) {
            if (currentLine.spans.length === 0 && isWhitespace(text.charCodeAt(currentSpan.offset + start))) {
                start++;
            }
            currentLine.spans.push(
                new Span(
                    currentSpan.offset + start,
                    end - start,
                    currentSpan.flags
                )
            );
            currentLine.updateDimensions(defaultFont)
            // printLine(currentLine);

            charIndex = end + delta
            if (newLine) {
                lines.push(currentLine);
                currentLine = new Line();
                lastBreakLocation = end;
                lastWhitespaceLocation = end;
            }
        }

        while (charIndex < currentSpan.length) {
            if (text.charAt(currentSpan.offset + charIndex) === "\n") {
                pushSpan(lastBreakLocation, charIndex, true, 1);
            }
            // Handle \\n in addition to \n because that's how it gets converted from blocks
            else if (text.charAt(currentSpan.offset + charIndex) === "\\" && text.charAt(currentSpan.offset + charIndex + 1) === "n") {
                pushSpan(lastBreakLocation, charIndex, true, 2);
                lastBreakLocation += 2;
            }
            else if (currentLine.width + font.charWidth * (charIndex - lastBreakLocation + 1) > maxWidth) {
                if (lastWhitespaceLocation <= lastBreakLocation && currentLine.spans.length === 0) {
                    pushSpan(lastBreakLocation, charIndex, true, 1);
                }
                else {
                    pushSpan(lastBreakLocation, Math.max(lastWhitespaceLocation, 0), true, 1);
                }
            }
            else if (isWhitespace(text.charCodeAt(currentSpan.offset + charIndex))) {
                lastWhitespaceLocation = charIndex;
                charIndex++;
            }
            else {
                charIndex++;
            }
        }

        if (charIndex > lastBreakLocation) {
            pushSpan(lastBreakLocation, currentSpan.length, false, 1);
        }
    }
    lines.push(currentLine)

    return lines;
}

function getSpanAtOffset(lines: Line[], offset: number) {
    let i = 0;
    for (const line of lines) {
        for (const span of line.spans) {
            i += span.length;
            if (i > offset) {
                return span;
            }
        }
    }
    return undefined;
}

const rainbow = img`245768ca`

function drawText(left: number, top: number, text: string, lines: Line[], defaultColor: number, defaultFont: image.Font, length: number) {
    let currentLeft = left;
    for (const line of lines) {
        currentLeft = left;
        for (const span of line.spans) {
            const font = getFontForSpan(span.flags) || defaultFont;
            const color = getColorForSpan(span.flags) || defaultColor;

            if (font.charHeight === line.height) {
                drawSpan(currentLeft, top, text.substr(span.offset, span.length), font, color, span.flags, left, length);
            }
            else {
                drawSpan(currentLeft, top + (line.height >> 1) - (font.charHeight >> 1), text.substr(span.offset, span.length), font, color, span.flags, left, length);
            }

            length -= span.length;
            if (length <= 0) return;

            currentLeft += font.charWidth * span.length
        }
        top += line.height;
    }
}

function drawSpan(left: number, top: number, text: string, font: image.Font, color: number, flags: number, absoluteLeft: number, length: number) {
    if (flags & Tag.Blinking) {
        if (Math.idiv(game.runtime(), 250) % 2 === 0) {
            return;
        }
    }
    if (flags & (Tag.Wavy | Tag.Shaky | Tag.Rainbow)) {
        const tick = Math.idiv(game.runtime(), 100);
        for (let i = 0; i < text.length; i++) {
            if (i >= length) return;
            let x = left + font.charWidth * i;
            let y = top;
            if (flags & Tag.Shaky) {
                x += randint(-1, 1);
                y += randint(-1, 1);
            }
            if (flags & Tag.Wavy) {
                y += Math.sin(((x - absoluteLeft) / 10) + tick) * 2;
            }
            if (flags & Tag.Rainbow) {
                color = rainbow.getPixel((Math.idiv(x - absoluteLeft, font.charWidth) + tick) % rainbow.width, 0);
            }
            screen.print(text.charAt(i), x, y, color, font);
        }
    }
    else if (length < text.length) {
        screen.print(text.substr(0, length), left, top, color, font);
    }
    else {
        screen.print(text, left, top, color, font);
    }
}


function printLine(line: Line) {
    let l = `${line.width} ${line.height}`;
    for (const span of line.spans) {
        l += `[${testText.substr(span.offset, span.length)}]`
    }
    outLines.push(l)
}

const testText = `<rainbow>HELLO</rainbow> <red>richard</red> <blink>it's</blink> <veryslow><big><shake>NICE</shake></big></veryslow> <c6>to</c6> <wave>see you</wave> <green>today</green>`


// const spans = getSpans(testText);
let maxWidth = 60;
const testSprite = new TextSprite(testText);
testSprite.setMaxWidth(60);
// testSprite.setVelocity(60, 40);
// testSprite.setBounceOnWall(true);
testSprite.animateForTime(10000);
// pause(3000)
// scene.setBackgroundColor(3);

// const lines = getLines(testText, spans, maxWidth);

// const defaultFont = image.font8;
// const defaultColor = 1;
// scene.createRenderable(1, () => {
//     drawText(20, 20, lines, defaultColor, defaultFont)
// })

// for (const line of lines) {
//     printLine(line);
// }
// console.log(outLines.join("\n"))