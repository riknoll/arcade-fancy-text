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

        protected nextId: number;
        protected startLine: number;
        protected drawnLines: number;
        protected animation: AnimationState;

        protected sound: music.Playable;

        constructor(public text: string, kind: number) {
            super(img`1`, kind);

            this.color = 1;
            this.maxWidth = 0;
            this.nextId = 0;
            this.textFlags = Flag.ChangeHeightWhileAnimating | Flag.AlwaysOccupyMaxWidth;
            this.setText(text);
            this.startLine = 0;

            state().sprites.push(this);
        }

        draw(drawLeft: number, drawTop: number) {
            const font = this.defaultFont || getDefaultFont(this.text);

            if (this.frame) {
                drawFrame(screen, this.frame, drawLeft, drawTop, this.width, this.height);
                const frameUnit = Math.idiv(this.frame.width, 3);
                drawFontText(
                    drawLeft + frameUnit,
                    drawTop + frameUnit,
                    this.text,
                    this.visibleLines(),
                    this.color,
                    font,
                    this.animation ? this.animation.getOffset() : this.text.length
                );
            }
            else {
                drawFontText(
                    drawLeft,
                    drawTop,
                    this.text,
                    this.visibleLines(),
                    this.color,
                    font,
                    this.animation ? this.animation.getOffset() : this.text.length
                );
            }
        }

        preUpdate(deltaTimeMillis: number) {
            if (this.animation) {
                if (this.animation.update(deltaTimeMillis)) {
                    if (this.sound) {
                        this.sound.play(music.PlaybackMode.InBackground);
                    }
                    if (this.textFlags & (Flag.ChangeHeightWhileAnimating | Flag.ChangeWidthWhileAnimating)) {
                        this.recalculateDimensions();
                    }
                }

                if (this.animation.isFinished()) {
                    this.animation = undefined;
                }
            }
        }

        length(): number {
            return calculateTextLength(this.lines, 0, this.lines.length);
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

        setMaxLines(lines: number) {
            this.drawnLines = lines;
        }

        setStartLine(line: number) {
            this.startLine = line;
            this.recalculateDimensions();
        }

        nextPage() {
            this.setStartLine(this.startLine + this.drawnLines);
        }

        hasNextPage() {
            if (this.drawnLines <= 0) return false;
            return this.startLine + this.drawnLines < this.lines.length
        }

        animateAtSpeed(charactersPerSecond: number) {
            this.animation = new AnimationState(
                this.nextId++,
                this.visibleLines(),
                Math.max(charactersPerSecond, 0.001),
                this.getAnimationStartOffset()
            )
            this.recalculateDimensions();
        }

        animateForTime(timeMillis: number) {
            let length: number;

            if (this.startLine > 0) {
                length = calculateAnimationLength(this.lines, this.startLine, this.startLine + this.drawnLines);
            }
            else {
                length = calculateAnimationLength(this.lines, 0, this.lines.length);
            }
            this.animateAtSpeed(length * 1000 / timeMillis)
        }

        remainingAnimationTime(): number {
            if (!this.animation) return 0;
            return this.animation.remainingAnimationTime();
        }

        pauseUntilAnimationIsComplete() {
            if (!this.animation) return;

            // If animate is called a second time, animationId will change and
            // the pause will end
            const id = this.animation.id;
            pauseUntil(() => !this.animation || id !== this.animation.id);
        }

        cancelAnimation() {
            this.animation = undefined;
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

            if (this.animation) {
                const old = this.animation;
                this.animation = new AnimationState(
                    old.id,
                    this.visibleLines(),
                    old.speed,
                    this.getAnimationStartOffset()
                );
                this.animation.setOffset(old.getOffset());
            }
        }

        protected recalculateDimensions() {
            let width = 0;
            let height = 0;

            if (this.animation && (this.textFlags & (Flag.ChangeHeightWhileAnimating | Flag.ChangeWidthWhileAnimating))) {
                let offset = 0;
                for (const line of this.animation.lines) {
                    let lineWidth = 0;
                    for (const span of line.spans) {
                        if (this.textFlags & Flag.ChangeWidthWhileAnimating) {
                            const font = getFontForSpan(span.flags) || this.defaultFont || getDefaultFont(this.text);

                            if (offset + span.length > this.animation.getOffset()) {
                                lineWidth += getTextWidth(font, this.text, span.offset, span.offset + (this.animation.getOffset() - offset))
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

                    if (offset > this.animation.getOffset()) break;
                }
            }
            else {
                for (const line of this.visibleLines()) {
                    width = Math.max(line.width, width);
                    height += line.height;
                }
            }

            // If we are drawing pages, we need to fix the height for the last page
            if (!(this.textFlags & Flag.ChangeHeightWhileAnimating) && this.drawnLines > 0) {
                height = 0;
                for (let i = 0; i < this.drawnLines; i++) {
                    height += this.lines[Math.max(0, this.lines.length - this.drawnLines - 1 + i)].height
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

        protected getAnimationStartOffset() {
            return calculateTextLength(this.lines, 0, this.startLine);
        }

        protected visibleLines() {
            if (this.drawnLines > 0) {
                return this.lines.slice(this.startLine, this.startLine + this.drawnLines);
            }
            return this.lines;
        }
    }

    class AnimationState {
        protected timer: number;
        protected offset: number;
        protected endOffset: number;

        constructor(
            public id: number,
            public lines: Line[],
            public speed: number,
            public startOffset: number
        ) {
            this.setOffset(0);
            this.endOffset = startOffset + calculateTextLength(lines, 0, lines.length);
        }

        setOffset(offset: number) {
            this.offset = offset;
            this.timer = this.getTimerAtOffset(offset);
        }

        getOffset() {
            return this.offset;
        }

        update(deltaTimeMillis: number) {
            if (this.isFinished()) return false;

            this.timer -= deltaTimeMillis;

            let didPrintCharacter = false;
            while (this.timer < 0) {
                this.offset++;
                this.timer += this.getTimerAtOffset(this.offset);
                didPrintCharacter = true;
            }

            if (this.startOffset + this.offset >= this.endOffset) return true;

            return didPrintCharacter;
        }

        remainingAnimationTime(): number {
            if (!this.speed) return 0;

            let time = this.timer;
            let i = 0;
            for (const line of this.lines) {
                for (const span of line.spans) {
                    if (i > this.offset) {
                        time += this.getTimerAtOffset(i) * span.length;
                    }
                    else if (i + span.length > this.offset) {
                        time += this.getTimerAtOffset(i) * (span.length - (this.offset - i))
                    }
                    i += span.length
                }
            }

            return time;
        }

        isFinished() {
            return this.startOffset + this.offset >= this.endOffset;
        }

        protected getTimerAtOffset(offset: number) {
            const span = getSpanAtOffset(this.lines, offset);

            let timer = 1000 / this.speed;

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

    function calculateTextLength(lines: Line[], startLine: number, endLine: number) {
        let length = 0;

        for (const line of lines.slice(startLine, endLine)) {
            for (const span of line.spans) {
                length += span.length
            }
        }

        return length;
    }

    function calculateAnimationLength(lines: Line[], startLine: number, endLine: number) {
        let length = 0;
        for (const line of lines.slice(startLine, endLine)) {
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

        return length;
    }

    export function getDefaultFont(text: string) {
        return new fancyText.LegacyFont(image.getFontForText(text));
    }
}