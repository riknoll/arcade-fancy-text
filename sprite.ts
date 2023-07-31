namespace SpriteKind {
    export const FancyText = SpriteKind.create();
}

namespace fancyText {
    export enum Flag {
        ChangeHeightWhileAnimating = 1 << 0,
        DrawUsingMaxWidth = 1 << 1
    }

    export class TextSprite extends sprites.ExtendableSprite {
        protected spans: Span[];
        protected lines: Line[];
        protected maxWidth: number;
        protected color: number;
        protected animationSpeed: number;
        protected animationOffset: number;
        protected animationTimer: number;
        protected animationLines: number;
        protected defaultFont: BaseFont;
        protected frame: Image;
        protected textFlags: number;

        constructor(public text: string) {
            super(img`1`, SpriteKind.FancyText);

            this.color = 1;
            this.maxWidth = 0;
            this.textFlags = Flag.ChangeHeightWhileAnimating;
            this.setText(text);
        }

        draw(drawLeft: number, drawTop: number) {
            const font = this.defaultFont || getDefaultFont(this.text);

            let lines = 0;
            if (this.frame) {
                drawFrame(screen, this.frame, drawLeft, drawTop, this.width, this.height);
                const frameUnit = Math.idiv(this.frame.width, 3);
                lines = drawFontText(drawLeft + frameUnit, drawTop + frameUnit, this.text, this.lines, this.color, font, this.animationSpeed ? this.animationOffset : this.text.length);
            }
            else {
                lines = drawFontText(drawLeft, drawTop, this.text, this.lines, this.color, font, this.animationSpeed ? this.animationOffset : this.text.length);
            }

            if (this.textFlags & Flag.ChangeHeightWhileAnimating) {
                if (lines !== this.animationLines) {
                    this.animationLines = lines;
                    this.recalculateDimensions();

                    if (this.frame) {
                        this.draw(drawLeft, drawTop)
                    }
                }
            }
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

        setText(text: string) {
            this.text = text;
            this.spans = getSpans(text);
            this.recalculateLines();
        }

        getText() {
            return this.text;
        }

        setMaxWidth(maxWidth: number) {
            this.maxWidth = Math.max(maxWidth, 0) | 0;
            this.recalculateLines();
        }

        setColor(color: number) {
            this.color = color;
        }

        getColor(): number {
            return this.color;
        }

        setFont(font: BaseFont) {
            this.defaultFont = font;
            this.recalculateLines();
        }

        animateAtSpeed(charactersPerSecond: number) {
            this.animationSpeed = charactersPerSecond;
            this.animationOffset = 0;
            this.animationTimer = this.getTimerAtOffset(0);
            this.animationLines = 1;
            this.recalculateDimensions();
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

        remainingAnimationTime(): number {
            if (!this.animationSpeed) return 0;

            let time = this.animationTimer;
            let i = 0;
            for (const line of this.lines) {
                for (const span of line.spans) {
                    if (i > this.animationOffset) {
                        time += this.getTimerAtOffset(i);
                    }
                    i += span.length
                }
            }

            return time;
        }

        setFrame(frame: Image) {
            if (frame) {
                if (frame.width !== frame.height || Math.idiv(frame.width, 3) * 3 !== frame.width) {
                    throw "Text frames must be square images with a side length divisble by 3"
                }

                if (frame.width < 12) {
                    const oldFrame = frame;
                    frame = image.create(12, 12);
                    drawFrame(frame, oldFrame, 0, 0, 12, 12);
                }
            }
            this.frame = frame;
            this.recalculateDimensions();
        }

        setTextFlag(flag: Flag, on: boolean) {
            if (on) {
                this.textFlags |= flag;
            }
            else {
                this.textFlags &= ~flag;
            }
        }

        protected recalculateLines() {
            if (this.maxWidth) {
                if (this.frame) {
                    const frameUnit = Math.idiv(this.frame.width, 3);
                    this.lines = getLines(this.text, this.spans, this.maxWidth - (frameUnit << 1), this.defaultFont || getDefaultFont(this.text));
                }
                else {
                    this.lines = getLines(this.text, this.spans, this.maxWidth, this.defaultFont || getDefaultFont(this.text));
                }
            }
            else {
                this.lines = getLines(this.text, this.spans, 0xffffffff, this.defaultFont || getDefaultFont(this.text));
            }

            this.recalculateDimensions();
        }

        protected recalculateDimensions() {
            let width = 0;
            let height = 0;

            let maxLine = this.lines.length;

            if (this.animationLines && this.textFlags & Flag.ChangeHeightWhileAnimating) {
                maxLine = this.animationLines;
            }

            for (let i = 0; i < this.lines.length; i++) {
                const line = this.lines[i];

                width = Math.max(line.width, width);
                if (i < maxLine) {
                    height += line.height;
                }
            }

            if (this.frame) {
                const frameUnit = Math.idiv(this.frame.width, 3);
                width += frameUnit << 1;
                height += frameUnit << 1
            }

            if (this.flags & Flag.DrawUsingMaxWidth && this.maxWidth) {
                width = this.maxWidth;
            }

            this.setDimensions(width, height)
        }

        protected getTimerAtOffset(offset: number) {
            const span = getSpanAtOffset(this.lines, offset);

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

    export function getDefaultFont(text: string) {
        return new fancyText.LegacyFont(image.getFontForText(text));
    }
}