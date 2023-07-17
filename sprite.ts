namespace SpriteKind {
    export const Text = SpriteKind.create();
}

namespace fancyText {
    export class TextSprite extends sprites.ExtendableSprite {
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
            const font = getDefaultFont(this.text);
            drawFontText(drawLeft, drawTop, this.text, this.lines, this.color, font, this.animationSpeed ? this.animationOffset : this.text.length);
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
}