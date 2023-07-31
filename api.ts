//% block="Fancy Text"
//% color="#bf42f5"
//$ icon="\uf031"
namespace fancyText {
    export enum TextSpeed {
        //% block="very slow"
        VerySlow = 4,
        //% block="slow"
        Slow = 8,
        //% block="normal"
        Normal = 12,
        //% block="fast"
        Fast = 16,
        //% block="very fast"
        VeryFast = 20
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
        const sprite = new TextSprite(text);

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
    //% help=github:arcade-fancy-text/docs/set-max-width
    export function setMaxWidth(sprite: Sprite, maxWidth: number) {
        assertTextSprite(sprite);
        (sprite as TextSprite).setMaxWidth(maxWidth);
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
    //% blockGap=8
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
     * @param font The frame to set on the TextSprite
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
     * Animates a TextSprite so that it prints itself character by character
     * at a given speed. The speed is in characters per second.
     *
     * @param sprite The TextSprite to animate
     * @param charactersPerSecond The speed to animate in characters per second
     */
    //% blockId=fancy_text_animate_at_speed
    //% block="$sprite animate $charactersPerSecond"
    //% sprite.shadow=variables_get
    //% sprite.defl=myTextSprite
    //% charactersPerSecond.shadow=fancy_text__speedPicker
    //% group=Animate
    //% weight=90
    //% blockGap=8
    //% help=github:arcade-fancy-text/docs/animate-at-speed
    export function animateAtSpeed(sprite: Sprite, charactersPerSecond: number) {
        assertTextSprite(sprite);
        (sprite as TextSprite).animateAtSpeed(charactersPerSecond);
    }

    /**
     * Animates a TextSprite so that is prints itself character by character
     * in a given time.
     *
     * @param sprite The TextSprite to animate
     * @param timeMillis The time that the animation should take in milliseconds
     */
    //% blockId=fancy_text_animate_for_time
    //% block="$sprite animate for $timeMillis ms"
    //% sprite.shadow=variables_get
    //% sprite.defl=myTextSprite
    //% timeMillis.shadow=timePicker
    //% group=Animate
    //% weight=80
    //% help=github:arcade-fancy-text/docs/animate-for-time
    export function animateForTime(sprite: Sprite, timeMillis: number) {
        assertTextSprite(sprite);
        (sprite as TextSprite).animateForTime(timeMillis);
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
    //% weight=70
    //% help=github:arcade-fancy-text/docs/remaining-animation-time
    export function remainingAnimationTime(sprite: Sprite) {
        assertTextSprite(sprite);
        return (sprite as TextSprite).remainingAnimationTime();
    }

    /**
     * A Font that can be used with TextSprites
     */
    //% shim=TD_ID
    //% blockId=fancy_text__fontPicker
    //% block="$font"
    //% group=Create
    //% weight=0
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

    //% whenUsed
    //% block="default arcade"
    //% blockIdentity=fancy_text__fontPicker
    //% fixedInstance
    export const defaultArcade: fancyText.BaseFont = new LegacyFont(image.font8);

    //% whenUsed
    //% block="unicode arcade"
    //% blockIdentity=fancy_text__fontPicker
    //% fixedInstance
    export const unicodeArcade: fancyText.BaseFont = new LegacyFont(image.font12);

    //% whenUsed
    //% block="small arcade"
    //% blockIdentity=fancy_text__fontPicker
    //% fixedInstance
    export const smallArcade: fancyText.BaseFont = new LegacyFont(image.font5);

    function assertTextSprite(sprite: Sprite) {
        if (!(sprite instanceof TextSprite)) {
            throw "Using TextSprite functions on a non TextSprite Sprite is not supported.";
        }
    }
}