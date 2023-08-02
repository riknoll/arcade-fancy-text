namespace SpriteKind {
    export const FancyText = SpriteKind.create();
}

namespace fancyText {
    class FancyTextState {
        sprites: TextSprite[]

        constructor() {
            this.sprites = [];

            const eventContext = game.currentScene().eventContext;
            eventContext.registerFrameHandler(scene.UPDATE_PRIORITY - 1, () => {
                let shouldPrune = false;
                const dt = eventContext.deltaTimeMillis
                for (const sprite of this.sprites) {
                    sprite.preUpdate(dt);

                    if (sprite.flags & sprites.Flag.Destroyed) {
                        shouldPrune = true;
                    }
                }

                if (shouldPrune) {
                    this.sprites = this.sprites.filter(s => !(s.flags & sprites.Flag.Destroyed));
                }
            });
        }
    }

    let stateStack: FancyTextState[];

    function init() {
        if (stateStack) return;
        stateStack = [new FancyTextState()];

        game.addScenePushHandler(() => {
            stateStack.push(new FancyTextState());
        });

        game.addScenePopHandler(() => {
            stateStack.pop();

            if (stateStack.length === 0) {
                stateStack.push(new FancyTextState());
            }
        });
    }

    function state() {
        init();
        return stateStack[stateStack.length - 1];
    }


    export class TextSprite extends sprites.ExtendableSprite {
        protected spans: Span[];
        protected lines: Line[];
        protected maxWidth: number;
        protected color: number;
        protected defaultFont: BaseFont;
        protected frame: Image;
        protected textFlags: number;

        protected animationSpeed: number;
        protected animationOffset: number;
        protected animationTimer: number;
        protected animationId: number;

        protected sound: music.Playable;

        constructor(public text: string, kind: number) {
            super(img`1`, kind);

            this.color = 1;
            this.maxWidth = 0;
            this.textFlags = Flag.ChangeHeightWhileAnimating | Flag.AlwaysOccupyMaxWidth;
            this.setText(text);
            this.animationId = 0;
            state().sprites.push(this);
        }

        draw(drawLeft: number, drawTop: number) {
            const font = this.defaultFont || getDefaultFont(this.text);

            if (this.frame) {
                drawFrame(screen, this.frame, drawLeft, drawTop, this.width, this.height);
                const frameUnit = Math.idiv(this.frame.width, 3);
                drawFontText(drawLeft + frameUnit, drawTop + frameUnit, this.text, this.lines, this.color, font, this.animationSpeed ? this.animationOffset : this.text.length);
            }
            else {
                drawFontText(drawLeft, drawTop, this.text, this.lines, this.color, font, this.animationSpeed ? this.animationOffset : this.text.length);
            }
        }

        preUpdate(deltaTimeMillis: number) {
            if (this.animationSpeed) {
                this.animationTimer -= deltaTimeMillis;

                let didPrintCharacter = false;
                while (this.animationTimer < 0) {
                    this.animationOffset++;
                    this.animationTimer += this.getTimerAtOffset(this.animationOffset);
                    didPrintCharacter = true;
                }

                if (this.animationOffset >= this.length()) this.animationSpeed = undefined;

                if (didPrintCharacter) {
                    if (this.sound) {
                        this.sound.play(music.PlaybackMode.InBackground);
                    }
                    if (this.textFlags & (Flag.ChangeHeightWhileAnimating | Flag.ChangeWidthWhileAnimating)) {
                        this.recalculateDimensions();
                    }
                }
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
            this.animationSpeed = Math.max(charactersPerSecond, 0.001);
            this.animationOffset = 0;
            this.animationTimer = this.getTimerAtOffset(0);
            this.animationId++;
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
                        time += this.getTimerAtOffset(i) * span.length;
                    }
                    else if (i + span.length > this.animationOffset) {
                        time += this.getTimerAtOffset(i) * (span.length - (this.animationOffset - i))
                    }
                    i += span.length
                }
            }

            return time;
        }

        pauseUntilAnimationIsComplete() {
            if (!this.animationSpeed) return;

            // If animate is called a second time, animationId will change and
            // the pause will end
            const id = this.animationId;
            pauseUntil(() => !this.animationSpeed || id !== this.animationId);
        }

        cancelAnimation() {
            this.animationSpeed = 0;
        }

        setAnimationSound(sound: music.Playable) {
            this.sound = sound;
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
            this.recalculateLines();
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

            if (this.animationSpeed && (this.textFlags & (Flag.ChangeHeightWhileAnimating | Flag.ChangeWidthWhileAnimating))) {
                let offset = 0;
                for (const line of this.lines) {
                    let lineWidth = 0;
                    for (const span of line.spans) {
                        if (this.textFlags & Flag.ChangeWidthWhileAnimating) {
                            const font = getFontForSpan(span.flags) || this.defaultFont;

                            if (offset + span.length > this.animationOffset) {
                                lineWidth += getTextWidth(font, this.text, span.offset, span.offset + (this.animationOffset - offset))
                                offset += span.length;
                                break;
                            }
                            else {
                                lineWidth += getTextWidth(font, this.text, span.offset, span.offset + span.length);
                                offset += span.length;
                            }
                        }
                        else {
                            offset += span.length;
                            lineWidth = line.width;
                        }
                    }

                    width = Math.max(lineWidth, width);
                    height += line.height;

                    if (offset > this.animationOffset) break;
                }

            }
            else {
                for (let i = 0; i < this.lines.length; i++) {
                    const line = this.lines[i];

                    width = Math.max(line.width, width);
                    height += line.height;
                }
            }

            if (this.frame) {
                const frameUnit = Math.idiv(this.frame.width, 3);
                width += frameUnit << 1;
                height += frameUnit << 1;
                width = Math.max(width, this.frame.width);
                height = Math.max(height, this.frame.height);
            }

            if (this.textFlags & Flag.AlwaysOccupyMaxWidth && this.maxWidth) {
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