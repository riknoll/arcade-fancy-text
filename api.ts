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

    //% blockId=fancy_text_create
    //% block="text sprite $text||with max width $maxWidth color $color font $font"
    //% text.defl="abc"
    //% maxWidth.defl=100
    //% maxWidth.min=0
    //% color.shadow=colorindexpicker
    //% font.shadow=fancy_text__fontPicker
    //% blockSetVariable=myTextSprite
    //% inlineInputMode=inline
    //% group=Create
    //% weight=100
    export function create(text: string, maxWidth?: number, color?: number, font?: BaseFont): TextSprite {
        const sprite = new TextSprite(text);

        if (maxWidth) sprite.setMaxWidth(maxWidth);
        if (color) sprite.setColor(color);
        if (font) sprite.setFont(font);

        sprite.x = screen.width >> 1;
        sprite.y = screen.height >> 1;

        return sprite;
    }

    //% shim=TD_ID
    //% blockId=fancy_text__fontPicker
    //% block="$font"
    //% group=Create
    //% weight=0
    export function __fontPicker(font: BaseFont): BaseFont {
        return font;
    }

    //% shim=TD_ID
    //% blockId=fancy_text__speedPicker
    //% block="$speed"
    //% group=Animate
    //% weight=0
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
}