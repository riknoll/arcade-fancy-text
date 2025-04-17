namespace fancyText {
    //% fixedInstances
    export class BaseFont {
        isDualTone: boolean;

        constructor() {
        }

        get lineHeight() {
            return 0;
        }

        get baselineOffset() {
            return 0;
        }

        get letterSpacing() {
            return 0;
        }

        get wordSpacing() {
            return 0;
        }

        get lineSpacing() {
            return 0;
        }

        bufferSize() {
            return 0;
        }

        charWidth(charCode: number) {
            return 0;
        }

        charXOffset(charCode: number) {
            return 0;
        }

        charYOffset(charCode: number) {
            return 0;
        }

        isInFont(charCode: number) {
            return false;
        }

        writeCharacterBytes(target: Buffer, charCode: number, dualTone?: boolean) {
            return target
        }

        getKernOffset(charCode1: number, charCode2: number) {
            return 0;
        }
    }

    export class LegacyFont extends BaseFont {
        constructor(public font: image.Font) {
            super();
        }

        get lineHeight() {
            return this.font.charHeight;
        }

        get baselineOffset() {
            return this.font.charHeight
        }

        get letterSpacing() {
            return 1;
        }

        get wordSpacing() {
            return this.font.charWidth;
        }

        charWidth(charCode: number) {
            return this.font.charWidth;
        }

        charYOffset(charCode: number) {
            return -this.font.charHeight;
        }

        isInFont(charCode: number) {
            return charCode >= 32;
        }

        bufferSize() {
            return 8 + ((this.font.charHeight + 7) >> 3) * this.font.charWidth;
        }

        writeCharacterBytes(target: Buffer, charCode: number, dualTone? : boolean) {
            if (charCode < 32) return target;

            let cp = 0
            let dataW = this.font.charWidth
            let dataH = this.font.charHeight
            let byteHeight = (dataH + 7) >> 3
            let charSize = byteHeight * dataW
            let dataSize = 2 + charSize
            let fontdata = this.font.data
            let lastchar = Math.idiv(fontdata.length, dataSize) - 1
            target[2] = dataW;
            target[4] = dataH;

            let l = 0
            let r = lastchar
            let off = 0 // this should be a space (0x0020)
            let guess = (charCode - 32) * dataSize
            if (fontdata.getNumber(NumberFormat.UInt16LE, guess) == charCode)
                off = guess
            else {
                while (l <= r) {
                    let m = l + ((r - l) >> 1);
                    let v = fontdata.getNumber(NumberFormat.UInt16LE, m * dataSize)
                    if (v == charCode) {
                        off = m * dataSize
                        break
                    }
                    if (v < charCode)
                        l = m + 1
                    else
                        r = m - 1
                }
            }

            target.write(8, fontdata.slice(off + 2, charSize))

            return target.slice(0, byteHeight * dataW + 8);
        }
    }

    // legacy
    const V1_FONT_MAGIC = 0x68f119db;

    const V2_FONT_MAGIC = 0x68f119dc;
    const V2_DUAL_TONE_FONT_MAGIC = 0x68f119dd;

    export class Font extends BaseFont {
        static V1_HEADER_LENGTH = 12;
        static V2_HEADER_LENGTH = 13;
        static LOOKUP_TABLE_ENTRY_LENGTH = 4;

        protected bitmapHeaderLength: number;
        protected magic: number;
        protected headerLength: number;
        protected _lineSpacing: number;

        constructor(public buffer: Buffer) {
            super();
            this.magic = buffer.getNumber(NumberFormat.UInt32LE, 0);

            this.isDualTone = this.magic === V2_DUAL_TONE_FONT_MAGIC;

            if (this.magic === V1_FONT_MAGIC) {
                this.bitmapHeaderLength = 5;
                this.headerLength = Font.V1_HEADER_LENGTH;
                this._lineSpacing = 0;
            }
            else {
                this.bitmapHeaderLength = 6;
                this.headerLength = Font.V2_HEADER_LENGTH;
                this._lineSpacing = buffer[10];
            }
        }

        get lineHeight() {
            return this.buffer[6];
        }

        get baselineOffset() {
            return this.buffer[7];
        }

        get letterSpacing() {
            return this.buffer[8];
        }

        get wordSpacing() {
            return this.buffer[9];
        }

        get lineSpacing() {
            return this._lineSpacing;
        }

        charWidth(charCode: number) {
            return this.buffer[this.charBitmapAddress(charCode)]
        }

        charXOffset(charCode: number) {
            return this.buffer.getNumber(NumberFormat.Int8LE, this.charBitmapAddress(charCode) + 3);
        }

        charYOffset(charCode: number) {
            return this.buffer.getNumber(NumberFormat.Int8LE, this.charBitmapAddress(charCode) + 4);
        }

        isInFont(charCode: number) {
            return this.charOffset(charCode) !== -1;
        }

        writeCharacterBytes(target: Buffer, charCode: number, dualTone? : boolean) {
            const offset = this.charOffset(charCode);
            if (offset === -1) return target;

            const bitmapEntryStart = this.buffer.getNumber(NumberFormat.UInt16LE, offset) + this.bitmapStart;

            const bitmapWidth = this.buffer[bitmapEntryStart + 1];
            const bitmapHeight = this.buffer[bitmapEntryStart + 2];

            target[2] = bitmapWidth;
            target[4] = bitmapHeight;

            const bitmapLength = bitmapWidth * ((bitmapHeight + 7) >> 3)
            const kernTableLength = this.buffer[bitmapEntryStart + 5]

            if (dualTone) {
                target.write(
                    8,
                    this.buffer.slice(
                        bitmapEntryStart + this.bitmapHeaderLength + bitmapLength + kernTableLength * 3,
                        bitmapLength
                    )
                )
            }
            else {
                target.write(
                    8,
                    this.buffer.slice(
                        bitmapEntryStart + this.bitmapHeaderLength + kernTableLength * 3,
                        bitmapLength
                    )
                )
            }

            return target.slice(0, 8 + bitmapLength);
        }

        bufferSize() {
            return 8 + this.buffer.getNumber(NumberFormat.UInt16LE, this.headerLength - 2);
        }

        getKernOffset(charCode1: number, charCode2: number) {
            if (this.magic === V1_FONT_MAGIC) return 0;

            const offset = this.charOffset(charCode1);
            if (offset === -1) return 0;

            const bitmapEntryStart = this.buffer.getNumber(NumberFormat.UInt16LE, offset) + this.bitmapStart;

            const kernTableLength = this.buffer[bitmapEntryStart + 5];

            if (kernTableLength === 0) return 0;

            for (let i = 0; i < kernTableLength; i++) {
                if (charCode2 === this.buffer.getNumber(NumberFormat.UInt16LE, bitmapEntryStart + this.bitmapHeaderLength + i * 3)) {
                    return this.buffer.getNumber(NumberFormat.Int8LE, bitmapEntryStart + this.bitmapHeaderLength + i * 3 + 2);
                }
            }

            return 0;
        }

        protected get numCharacters() {
            return this.buffer.getNumber(
                NumberFormat.UInt16LE,
                4
            );
        }

        protected get bitmapStart() {
            return this.headerLength + Font.LOOKUP_TABLE_ENTRY_LENGTH * this.numCharacters
        }

        protected charOffset(charCode: number) {
            let start = 0;
            let end = this.numCharacters;
            let guess = this.numCharacters >> 1;

            while (true) {
                // console.log(`${charCode} S=${start} E=${end} G=${guess}`)
                if (start === end) {
                    return -1;
                }

                const current = this.buffer.getNumber(NumberFormat.UInt16LE, this.headerLength + Font.LOOKUP_TABLE_ENTRY_LENGTH * guess);
                // console.log("CURRENT " + current)
                if (current === charCode) {
                    // console.log("FOUND IT!")
                    return this.headerLength + Font.LOOKUP_TABLE_ENTRY_LENGTH * guess + 2;
                }
                else if (charCode < current) {
                    end = guess;
                    guess = ((end - start) >> 1) + start;
                }
                else {
                    start = guess;
                    guess = ((end - start) >> 1) + start;
                }
            }
        }

        protected charBitmapAddress(charCode: number) {
            return this.buffer.getNumber(NumberFormat.UInt16LE, this.charOffset(charCode)) + this.bitmapStart;
        }
    }

    export function getTextWidth(font: fancyText.BaseFont, text: string, start = 0, end?: number) {
        if (end == undefined) end = text.length;

        let w = 0;
        for (let i = start; i < end; i++) {
            const code = text.charCodeAt(i);
            if (code === 32 || !font.isInFont(code)) {
                w += font.wordSpacing;
            }
            else {
                w += font.charWidth(code) + font.letterSpacing;

                if (i < end - 1) {
                    w += font.getKernOffset(code, text.charCodeAt(i + 1));
                }
            }
        }
        return w;
    }
}