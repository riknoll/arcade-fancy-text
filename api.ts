//% block="Fancy Text"
//% color="#bf42f5"
//$ icon="\uf031"
namespace fancyText {
    //% blockIdentity="fancyText.__speedPicker"
    export enum TextSpeed {
        //% block="very slow"
        //% blockIdentity="fancyText.__speedPicker"
        VerySlow = 4,

        //% block="slow"
        //% blockIdentity="fancyText.__speedPicker"
        Slow = 8,

        //% block="normal"
        //% blockIdentity="fancyText.__speedPicker"
        Normal = 12,

        //% block="fast"
        //% blockIdentity="fancyText.__speedPicker"
        Fast = 16,

        //% block="very fast"
        //% blockIdentity="fancyText.__speedPicker"
        VeryFast = 20
    }

    //% blockIdentity="fancyText.__textFlagPicker"
    export enum Flag {
        //% block="change height while animating"
        //% blockIdentity="fancyText.__textFlagPicker"
        ChangeHeightWhileAnimating = 1 << 0,

        //% block="change width while animating"
        //% blockIdentity="fancyText.__textFlagPicker"
        ChangeWidthWhileAnimating = 1 << 1,

        //% block="always occupy max width"
        //% blockIdentity="fancyText.__textFlagPicker"
        AlwaysOccupyMaxWidth = 1 << 2
    }

    export enum AnimationPlayMode {
        //% block="until done"
        UntilDone,
        //% block="in background"
        InBackground
    }

    /**
     * Creates a TextSprite that shows some text. TextSprites can use all of the blocks from the Sprites category.
     *
     * @param text The text for the sprite to display
     * @param maxWidth The maximum width of the text. If the text is wider, it will be broken into multiple lines
     * @param color The color of the text
     * @param font The font to use when drawing the text
     * @returns A TextSprite with the FancyText SpriteKind
     */
    //% blockId=fancy_text_create
    //% block="text sprite $text||with max width $maxWidth color $color font $font"
    //% text.defl="abc"
    //% maxWidth.defl=0
    //% maxWidth.min=0
    //% color.shadow=colorindexpicker
    //% font.shadow=fancy_text__fontPicker
    //% blockSetVariable=myTextSprite
    //% inlineInputMode=inline
    //% group=Create
    //% weight=100
    //% help=github:arcade-fancy-text/docs/create
    export function create(text: string, maxWidth?: number, color?: number, font?: BaseFont): TextSprite {
        const sprite = new TextSprite(text, SpriteKind.FancyText);

        if (maxWidth) sprite.setMaxWidth(maxWidth);
        if (color) sprite.setColor(color);
        if (font) sprite.setFont(font);

        sprite.x = screen.width >> 1;
        sprite.y = screen.height >> 1;

        return sprite;
    }

    /**
     * Sets the text of a TextSprite.
     *
     * @param sprite The TextSprite to set the text on
     * @param text The text to set for the TextSprite
     */
    //% blockId=fancy_text_set_text
    //% block="$sprite set text $text"
    //% sprite.shadow=variables_get
    //% sprite.defl=myTextSprite
    //% text.defl="abc"
    //% group=Create
    //% weight=90
    //% blockGap=8
    //% help=github:arcade-fancy-text/docs/set-text
    export function setText(sprite: Sprite, text: string) {
        assertTextSprite(sprite);
        (sprite as TextSprite).setText(text);
    }

    /**
     * Gets the text of a TextSprite.
     *
     * @param sprite The TextSprite to get the text of
     * @returns The text of the TextSprite
     */
    //% blockId=fancy_text_get_text
    //% block="$sprite text"
    //% sprite.shadow=variables_get
    //% sprite.defl=myTextSprite
    //% group=Create
    //% weight=85
    //% help=github:arcade-fancy-text/docs/get-text
    export function getText(sprite: Sprite) {
        assertTextSprite(sprite);
        return (sprite as TextSprite).getText();
    }

    /**
     * Sets the maximum width that this TextSprite can draw to. If the
     * given text is wider than this width, it will be broken up into
     * multiple lines.
     *
     * @param sprite The TextSprite to set the maximum width on
     * @param maxWidth The maximum width the TextSprite can draw to
     */
    //% blockId=fancy_text_set_max_width
    //% block="$sprite set max width $maxWidth"
    //% sprite.shadow=variables_get
    //% sprite.defl=myTextSprite
    //% maxWidth.defl="100"
    //% group=Create
    //% weight=80
    //% blockGap=8
    //% help=github:arcade-fancy-text/docs/set-max-width
    export function setMaxWidth(sprite: Sprite, maxWidth: number) {
        assertTextSprite(sprite);
        (sprite as TextSprite).setMaxWidth(maxWidth);
    }

    /**
     * Sets the height for each line in the text. This overrides
     * the height set by the chosen font. Passing 0 will reset
     * the line height to the default behavior
     *
     * @param sprite The TextSprite to set the frame on
     * @param height The height for each line of the text
     */
    //% blockId=fancy_text_set_line_height
    //% block="$sprite set line height $height"
    //% sprite.shadow=variables_get
    //% sprite.defl=myTextSprite
    //% height.min=0
    //% height.max=48
    //% group=Create
    //% weight=79
    //% blockGap=8
    //% help=github:arcade-fancy-text/docs/set-line-height
    export function setLineHeight(sprite: Sprite, height: number) {
        assertTextSprite(sprite);
        (sprite as TextSprite).setLineHeight(height);
    }

    /**
     * Sets the minimum number of lines to be used when
     * calculating the height of this TextSprite. The sprite
     * can exceed this number of lines if the max width is
     * set and the chosen text cannot fit within this number
     * of lines.
     *
     * @param sprite The TextSprite to set the frame on
     * @param lines The minimum number of lines to use in height calculations
     */
    //% blockId=fancy_text_set_min_lines
    //% block="$sprite set minimum lines $lines"
    //% sprite.shadow=variables_get
    //% sprite.defl=myTextSprite
    //% lines.min=0
    //% lines.max=10
    //% group=Create
    //% weight=78
    //% help=github:arcade-fancy-text/docs/set-min-lines
    export function setMinLines(sprite: Sprite, lines: number) {
        assertTextSprite(sprite);
        (sprite as TextSprite).setMinLines(lines);
    }

    /**
     * Sets the color of the text drawn by this TextSprite.
     *
     * @param sprite The TextSprite to set the color of
     * @param color The color to use when drawing this TextSprite
     */
    //% blockId=fancy_text_set_color
    //% block="$sprite set color $color"
    //% sprite.shadow=variables_get
    //% sprite.defl=myTextSprite
    //% color.shadow=colorindexpicker
    //% group=Create
    //% weight=70
    //% blockGap=8
    //% help=github:arcade-fancy-text/docs/set-color
    export function setColor(sprite: Sprite, color: number) {
        assertTextSprite(sprite);
        (sprite as TextSprite).setColor(color);
    }

    /**
     * Gets the color of this TextSprite.
     *
     * @param sprite The TextSprite to get the color of
     * @returns The color of this TextSprite
     */
    //% blockId=fancy_text_get_color
    //% block="$sprite color"
    //% sprite.shadow=variables_get
    //% sprite.defl=myTextSprite
    //% group=Create
    //% weight=65
    //% help=github:arcade-fancy-text/docs/get-color
    export function getColor(sprite: Sprite) {
        assertTextSprite(sprite);
        return (sprite as TextSprite).getColor();
    }

    /**
     * Sets the font used when drawing this TextSprite. Not all fonts
     * can be used with all characters, so try using the "arcade default"
     * or "arcade unicode" font if your text is displaying incorrectly
     *
     * @param sprite The TextSprite to set the font on
     * @param font The font to set on the TextSprite
     */
    //% blockId=fancy_text_set_font
    //% block="$sprite set font $font"
    //% sprite.shadow=variables_get
    //% sprite.defl=myTextSprite
    //% font.shadow=fancy_text__fontPicker
    //% group=Create
    //% weight=60
    //% blockGap=8
    //% help=github:arcade-fancy-text/docs/set-font
    export function setFont(sprite: Sprite, font: BaseFont) {
        assertTextSprite(sprite);
        (sprite as TextSprite).setFont(font);
    }


    /**
     * Sets a frame to be drawn around this TextSprite
     *
     * @param sprite The TextSprite to set the frame on
     * @param frame The frame to set on the TextSprite
     */
    //% blockId=fancy_text_set_frame
    //% block="$sprite set frame $frame"
    //% sprite.shadow=variables_get
    //% sprite.defl=myTextSprite
    //% frame.shadow=dialog_image_picker
    //% group=Create
    //% weight=50
    //% blockGap=8
    //% help=github:arcade-fancy-text/docs/set-frame
    export function setFrame(sprite: Sprite, frame: Image) {
        assertTextSprite(sprite);
        (sprite as TextSprite).setFrame(frame);
    }

    /**
     * Sets a flag on a TextSprite. Flags are used to customize
     * various settings for a TextSprite
     *
     * @param sprite The TextSprite to set the flag on
     * @param flag The flag to set the value of
     * @param on The value to set the flag to
     */
    //% blockId=fancy_text_set_text_flag
    //% block="$sprite set flag $flag to $on"
    //% sprite.shadow=variables_get
    //% sprite.defl=myTextSprite
    //% flag.shadow=fancy_text__textFlagPicker
    //% on.shadow=toggleOnOff
    //% group=Create
    //% weight=10
    //% blockGap=8
    //% help=github:arcade-fancy-text/docs/set-text-flag
    export function setTextFlag(sprite: Sprite, flag: number, on: boolean) {
        assertTextSprite(sprite);
        (sprite as TextSprite).setTextFlag(flag, on);
    }

    /**
     * Animates a TextSprite so that it prints itself character by character
     * at a given speed. The speed is in characters per second.
     *
     * @param sprite The TextSprite to animate
     * @param charactersPerSecond The speed to animate in characters per second
     */
    //% blockId=fancy_text_animate_at_speed
    //% block="$sprite animate $charactersPerSecond $mode"
    //% sprite.shadow=variables_get
    //% sprite.defl=myTextSprite
    //% charactersPerSecond.shadow=fancy_text__speedPicker
    //% group=Animate
    //% weight=90
    //% blockGap=8
    //% help=github:arcade-fancy-text/docs/animate-at-speed
    export function animateAtSpeed(sprite: Sprite, charactersPerSecond: number, mode: AnimationPlayMode) {
        assertTextSprite(sprite);
        (sprite as TextSprite).animateAtSpeed(charactersPerSecond);

        if (mode === AnimationPlayMode.UntilDone) {
            (sprite as TextSprite).pauseUntilAnimationIsComplete()
        }
    }

    /**
     * Animates a TextSprite so that is prints itself character by character
     * in a given time.
     *
     * @param sprite The TextSprite to animate
     * @param timeMillis The time that the animation should take in milliseconds
     */
    //% blockId=fancy_text_animate_for_time
    //% block="$sprite animate for $timeMillis ms $mode"
    //% sprite.shadow=variables_get
    //% sprite.defl=myTextSprite
    //% timeMillis.shadow=timePicker
    //% group=Animate
    //% weight=80
    //% help=github:arcade-fancy-text/docs/animate-for-time
    export function animateForTime(sprite: Sprite, timeMillis: number, mode: AnimationPlayMode) {
        assertTextSprite(sprite);
        (sprite as TextSprite).animateForTime(timeMillis);

        if (mode === AnimationPlayMode.UntilDone) {
            (sprite as TextSprite).pauseUntilAnimationIsComplete()
        }
    }

    /**
     * Cancels any text animation running on this TextSprite.
     *
     * @param sprite The TextSprite to cancel the animation on
     */
    //% blockId=fancy_text_cancel_animation
    //% block="$sprite cancel text animation"
    //% sprite.shadow=variables_get
    //% sprite.defl=myTextSprite
    //% group=Animate
    //% weight=70
    //% help=github:arcade-fancy-text/docs/cancel-animation
    export function cancelAnimation(sprite: Sprite) {
        assertTextSprite(sprite);
        (sprite as TextSprite).cancelAnimation();
    }

    /**
     * Calculates the remaining time in any printing animation started on a
     * TextSprite. Returns 0 if no animation has been started.
     *
     * @param sprite The TextSprite to calculate the remaining animation time of
     * @returns The remaining time in the animation or 0 if the TextSprite is not animating
     */
    //% blockId=fancy_text_remaining_animation_time
    //% block="$sprite animation millis left"
    //% sprite.shadow=variables_get
    //% sprite.defl=myTextSprite
    //% group=Animate
    //% weight=60
    //% help=github:arcade-fancy-text/docs/remaining-animation-time
    export function remainingAnimationTime(sprite: Sprite) {
        assertTextSprite(sprite);
        return (sprite as TextSprite).remainingAnimationTime();
    }

    /**
     * Sets a sound to be played every time a character is printed while
     * a TextSprite is animating.
     *
     * @param sprite The TextSprite to set the sound on
     * @param sound The sound to play when a character is printed
     * @returns The remaining time in the animation or 0 if the TextSprite is not animating
     */
    //% blockId=fancy_text_set_animation_sound
    //% block="$sprite set animation sound $sound"
    //% sprite.shadow=variables_get
    //% sprite.defl=myTextSprite
    //% sound.shadow=soundExpression_createSoundEffect
    //% group=Animate
    //% weight=40
    //% help=github:arcade-fancy-text/docs/set-animation-sound
    export function setAnimationSound(sprite: Sprite, sound: music.Playable) {
        assertTextSprite(sprite);
        (sprite as TextSprite).setAnimationSound(sound);
    }

    /**
     * Draws some text to an image or the screen.
     *
     * @param text The text for the sprite to display
     * @param target The image to draw the text to
     * @param left The x value to draw the text at
     * @param top The y value to draw the text at
     * @param maxWidth The maximum width of the text. If the text is wider, it will be broken into multiple lines
     * @param color The color of the text
     * @param font The font to use when drawing the text
     */
    //% blockId=fancy_text_draw
    //% block="draw $text to $target at x $left y $top||with max width $maxWidth color $color font $font"
    //% text.defl="abc"
    //% target.shadow=fancy_text_get_screen
    //% maxWidth.defl=0
    //% maxWidth.min=0
    //% color.shadow=colorindexpicker
    //% font.shadow=fancy_text__fontPicker
    //% blockSetVariable=myTextSprite
    //% inlineInputMode=inline
    //% group=Draw
    //% weight=100
    //% help=github:arcade-fancy-text/docs/create
    export function draw(text: string, target: Image, left: number, top: number, maxWidth?: number, color?: number, font?: BaseFont): void {
        font = font || getDefaultFont(text);
        color = color === undefined ? 1 : color;
        maxWidth = maxWidth || 0xffffffff;

        const spans = getSpans(text);
        const lines = getLines(text, spans, maxWidth, font);

        drawFontText(left, top, text, lines, color, font, text.length, target);
    }

    /**
     * Returns a reference to the screen image. Note that drawing to this image will
     * have no effect unless done at the correct step in the game's render loop.
     *
     * @returns The screen image
     */
    //% blockId=fancy_text_get_screen
    //% block="screen"
    //% blockHidden=1
    export function getScreen(): Image {
        return screen;
    }

    /**
     * A Font that can be used with TextSprites
     */
    //% shim=TD_ID
    //% blockId=fancy_text__fontPicker
    //% block="$font"
    //% group=Create
    //% weight=5
    //% help=github:arcade-fancy-text/docs/font
    export function __fontPicker(font: BaseFont): BaseFont {
        return font;
    }

    /**
     * A TextSpeed that can control how fast a TextSprite is animated. This returns
     * a speed in characters per second.
     */
    //% shim=TD_ID
    //% blockId=fancy_text__speedPicker
    //% block="$speed"
    //% group=Animate
    //% weight=0
    //% help=github:arcade-fancy-text/docs/text-speed
    export function __speedPicker(speed: TextSpeed): number {
        return speed;
    }

    /**
     * A Flag that can be set to on or off for a TextSprite. Flags let you customize
     * the way a TextSprite behaves.
     */
    //% shim=TD_ID
    //% blockId=fancy_text__textFlagPicker
    //% block="$flag"
    //% group=Create
    //% weight=0
    //% help=github:arcade-fancy-text/docs/flag
    export function __textFlagPicker(flag: Flag): number {
        return flag;
    }

    //% whenUsed
    //% block="default arcade"
    //% blockIdentity="fancyText.__fontPicker"
    //% fixedInstance
    export const defaultArcade: fancyText.BaseFont = new LegacyFont(image.font8);

    //% whenUsed
    //% block="unicode arcade"
    //% blockIdentity="fancyText.__fontPicker"
    //% fixedInstance
    export const unicodeArcade: fancyText.BaseFont = new LegacyFont(image.font12);

    //% whenUsed
    //% block="small arcade"
    //% blockIdentity="fancyText.__fontPicker"
    //% fixedInstance
    export const smallArcade: fancyText.BaseFont = new LegacyFont(image.font5);

    function assertTextSprite(sprite: Sprite) {
        if (!(sprite instanceof TextSprite)) {
            throw "Using TextSprite functions on a non TextSprite Sprite is not supported.";
        }
    }
}