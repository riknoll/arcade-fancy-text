namespace fancyText {
    export enum Tag {
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

    export class Span {
        constructor(public offset: number, public length: number, public flags: number) {}
    }

    export class Line {
        spans: Span[];
        height: number;
        width: number;

        constructor() {
            this.spans = [];
            this.height = 0;
            this.width = 0;
        }

        updateDimensions(defaultFont: fancyText.BaseFont, text: string) {
            this.width = 0;
            this.height = 0;

            for (const span of this.spans) {
                const font = getFontForSpan(span.flags) || defaultFont;
                this.width += getTextWidth(font, text, span.offset, span.offset + span.length);
                this.height = Math.max(this.height, font.lineHeight)
            }
        }
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

    export function getSpans(text: string) {
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

        const lastSpan = spans[spans.length - 1];

        if (!lastSpan || state.spanStart !== lastSpan.offset) {
            spans.push(new Span(state.spanStart, state.offset - state.spanStart, state.flags));
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

    export function getFontForSpan(flags: number) {
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


    export function getLines(text: string, spans: Span[], maxWidth: number, defaultFont: BaseFont) {
        const lines: Line[] = [];
        let currentLine = new Line();

        for (let spanIndex = 0; spanIndex < spans.length; spanIndex++) {
            const currentSpan = spans[spanIndex]
            const font = getFontForSpan(currentSpan.flags) || defaultFont;
            maxWidth = Math.max(maxWidth, font.wordSpacing);

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
                currentLine.updateDimensions(defaultFont, text)
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
                else if (currentLine.width + getTextWidth(font, text, lastBreakLocation, charIndex + 1) > maxWidth) {
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
}