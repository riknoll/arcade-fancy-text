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
        protected defaultFont: BaseFont;

        constructor(public text: string) {
            super(img`1`, SpriteKind.Text);

            this.color = 1;
            this.maxWidth = 0xffffffff;
            this.setText(text);
        }

        draw(drawLeft: number, drawTop: number) {
            const font = this.defaultFont || getDefaultFont(this.text);
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

        //% blockId=fancy_text_set_max_width
        //% block="$this set max width $maxWidth"
        //% this.shadow=variables_get
        //% this.defl=myTextSprite
        //% maxWidth.defl="100"
        setMaxWidth(maxWidth: number) {
            this.maxWidth = maxWidth;
            this.recalculateLines();
        }

        //% blockId=fancy_text_set_text
        //% block="$this set text $text"
        //% this.shadow=variables_get
        //% this.defl=myTextSprite
        //% text.defl="abc"
        setText(text: string) {
            this.text = text;
            this.spans = getSpans(text);
            this.recalculateLines();
        }

        //% blockId=fancy_text_get_text
        //% block="$this text"
        //% this.shadow=variables_get
        //% this.defl=myTextSprite
        getText() {
            return this.text;
        }

        //% blockId=fancy_text_set_color
        //% block="$this set color $color"
        //% this.shadow=variables_get
        //% this.defl=myTextSprite
        //% color.shadow=colorindexpicker
        setColor(color: number) {
            this.color = color;
        }

        //% blockId=fancy_text_get_color
        //% block="$this color"
        //% this.shadow=variables_get
        //% this.defl=myTextSprite
        getColor(): number {
            return this.color;
        }

        //% blockId=fancy_text_set_font
        //% block="$this set font $font"
        //% this.shadow=variables_get
        //% this.defl=myTextSprite
        //% font.shadow=fancy_text__fontPicker
        setFont(font: BaseFont) {
            this.defaultFont = font;
        }

        //% blockId=fancy_text_animate_at_speed
        //% block="$this animate $charactersPerSecond"
        //% this.shadow=variables_get
        //% this.defl=myTextSprite
        //% charactersPerSecond.shadow=fancy_text__speedPicker
        animateAtSpeed(charactersPerSecond: number) {
            this.animationSpeed = charactersPerSecond;
            this.animationOffset = 0;
            this.animationTimer = this.getTimerAtOffset(0);
        }

        //% blockId=fancy_text_animate_for_time
        //% block="$this animate for $timeMillis ms"
        //% this.shadow=variables_get
        //% this.defl=myTextSprite
        //% timeMillis.shadow=timePicker
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

        //% blockId=fancy_text_remaining_animation_time
        //% block="$this animation millis left"
        //% this.shadow=variables_get
        //% this.defl=myTextSprite
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
}